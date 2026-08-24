import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { spawn } from 'child_process';
import { z } from 'zod';

/**
 * Creates a StructKit generate action.
 *
 * @remarks
 * This action executes the `structkit` CLI to generate code from YAML structure files.
 * The structkit CLI must be available on the PATH of the Backstage backend host.
 *
 * @public
 */
export function createStructKitGenerateAction() {
  return createTemplateAction({
    id: 'structkit:generate',
    description:
      'Generates code from a StructKit YAML structure file into the workspace',
    schema: {
      input: {
        structure: z =>
          z
            .string({
              description:
                'Name of the structure to generate (e.g., "nextjs-app")',
            })
            .optional(),
        structFile: z =>
          z
            .string({
              description:
                'Path to a custom structure YAML file (alternative to structure name)',
            })
            .optional(),
        outputPath: z =>
          z
            .string({
              description:
                'Relative path within the workspace where files should be generated (default: ".")',
            })
            .default('.'),
        vars: z =>
          z
            .record(z.string(), z.any())
            .describe(
              'Variables to pass to the structure template (e.g., {"project_name": "my-app"})',
            )
            .optional(),
        dryRun: z =>
          z
            .boolean({
              description:
                'If true, only shows what would be generated without writing files',
            })
            .default(false),
        noHooks: z =>
          z
            .boolean({
              description:
                'If true, skips running post-generation hooks (default: true for safety)',
            })
            .default(true),
        extraArgs: z =>
          z
            .array(z.string())
            .describe('Additional CLI arguments to pass to structkit')
            .optional(),
      },
      output: {
        filesGenerated: z =>
          z
            .number()
            .describe('Number of files generated (when available)')
            .optional(),
      },
    },

    async handler(ctx) {
      const {
        structure,
        structFile,
        outputPath,
        vars,
        dryRun,
        noHooks,
        extraArgs = [],
      } = ctx.input;

      if (!structure && !structFile) {
        throw new Error(
          'Either "structure" or "structFile" input is required',
        );
      }

      if (structure && structFile) {
        ctx.logger.warn(
          'Both "structure" and "structFile" provided; "structFile" will take precedence',
        );
      }

      const resolvedOutputPath = resolveSafeChildPath(
        ctx.workspacePath,
        outputPath,
      );

      ctx.logger.info(
        `Generating StructKit ${structFile ? `from file: ${structFile}` : `structure: ${structure}`} into ${resolvedOutputPath}`,
      );

      const args: string[] = ['generate'];

      if (structFile) {
        args.push('--struct-file', structFile);
      } else if (structure) {
        args.push(structure);
      }

      args.push('--output', resolvedOutputPath);

      if (vars && Object.keys(vars).length > 0) {
        for (const [key, value] of Object.entries(vars)) {
          args.push('--var', `${key}=${String(value)}`);
        }
      }

      if (dryRun) {
        args.push('--dry-run');
      }

      if (noHooks) {
        args.push('--no-hooks');
      }

      if (extraArgs.length > 0) {
        args.push(...extraArgs);
      }

      ctx.logger.info(`Executing: structkit ${args.join(' ')}`);

      let stdout = '';

      await new Promise<void>((resolve, reject) => {
        const child = spawn('structkit', args, {
          cwd: ctx.workspacePath,
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stderr = '';

        child.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          stdout += text;
          ctx.logger.info(text.trim());
        });

        child.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderr += text;
          ctx.logger.warn(text.trim());
        });

        child.on('error', (error: Error) => {
          reject(
            new Error(
              `Failed to execute structkit CLI: ${error.message}. ` +
                'Ensure that structkit is installed and available on the PATH of the Backstage backend host.',
            ),
          );
        });

        child.on('close', (code: number | null) => {
          if (code === 0) {
            ctx.logger.info('StructKit generation completed successfully');
            resolve();
          } else {
            reject(
              new Error(
                `structkit CLI exited with code ${code}\n` +
                  `stdout: ${stdout}\n` +
                  `stderr: ${stderr}`,
              ),
            );
          }
        });
      });

      const filesGeneratedMatch = /(\d+)\s+files?\s+generated/i.exec(stdout);
      if (filesGeneratedMatch) {
        ctx.output('filesGenerated', parseInt(filesGeneratedMatch[1], 10));
      }
    },
  });
}
