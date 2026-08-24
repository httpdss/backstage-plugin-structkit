import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { z } from 'zod';
import { Config } from '@backstage/config';

/**
 * Creates a StructKit vars action.
 *
 * @remarks
 * This action retrieves the required template variables for a StructKit structure.
 * The structkit CLI must be available on the PATH of the Backstage backend host.
 *
 * @public
 */
export function createStructKitVarsAction(options?: { config?: Config }) {
  const structkitBinary =
    options?.config?.getOptionalString('structkit.binaryPath') ?? 'structkit';

  return createTemplateAction({
    id: 'structkit:vars',
    description:
      'Retrieves the required template variables for a StructKit structure',
    schema: {
      input: {
        structure: z =>
          z
            .string({
              description:
                'Name of the structure to get variables for (e.g., "nextjs-app")',
            })
            .optional(),
        structFile: z =>
          z
            .string({
              description:
                'Path to a custom structure YAML file (alternative to structure name)',
            })
            .optional(),
      },
      output: {
        vars: z =>
          z
            .array(
              z.object({
                name: z.string(),
                description: z.string().optional(),
                required: z.boolean().optional(),
                default: z.any().optional(),
              }),
            )
            .describe('Array of template variables'),
      },
    },

    async handler(ctx) {
      const { structure, structFile } = ctx.input;

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

      ctx.logger.info(
        `Getting variables for StructKit ${structFile ? `file: ${structFile}` : `structure: ${structure}`}`,
      );

      const args: string[] = ['vars'];

      if (structFile) {
        args.push('--struct-file', structFile);
      } else if (structure) {
        args.push(structure);
      }

      args.push('--format', 'json');

      ctx.logger.info(`Executing: ${structkitBinary} ${args.join(' ')}`);

      let stdout = '';

      await new Promise<void>((resolve, reject) => {
        const child = spawn(structkitBinary, args, {
          cwd: ctx.workspacePath,
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stderr = '';

        child.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          stdout += text;
        });

        child.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderr += text;
          ctx.logger.warn(text.trim());
        });

        child.on('error', (error: Error) => {
          reject(
            new Error(
              `Failed to execute ${structkitBinary} CLI: ${error.message}. ` +
                `Ensure that structkit is installed and available on the PATH of the Backstage backend host.`,
            ),
          );
        });

        child.on('close', (code: number | null) => {
          if (code === 0) {
            ctx.logger.info('StructKit vars completed successfully');
            resolve();
          } else {
            reject(
              new Error(
                `${structkitBinary} CLI exited with code ${code}\n` +
                  `stdout: ${stdout}\n` +
                  `stderr: ${stderr}`,
              ),
            );
          }
        });
      });

      try {
        const vars = JSON.parse(stdout);
        ctx.output('vars', vars);
        ctx.logger.info(`Found ${vars.length} variables`);
      } catch (error) {
        ctx.logger.warn(
          `Failed to parse JSON output, returning empty array: ${error}`,
        );
        ctx.output('vars', []);
      }
    },
  });
}
