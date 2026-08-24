import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { z } from 'zod';
import { Config } from '@backstage/config';

/**
 * Creates a StructKit info action.
 *
 * @remarks
 * This action retrieves information about a specific StructKit structure.
 * The structkit CLI must be available on the PATH of the Backstage backend host.
 *
 * @public
 */
export function createStructKitInfoAction(options?: { config?: Config }) {
  const structkitBinary =
    options?.config?.getOptionalString('structkit.binaryPath') ?? 'structkit';

  return createTemplateAction({
    id: 'structkit:info',
    description:
      'Retrieves detailed information about a specific StructKit structure',
    schema: {
      input: {
        structure: z =>
          z
            .string({
              description:
                'Name of the structure to get info about (e.g., "nextjs-app")',
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
        info: z =>
          z
            .record(z.string(), z.any())
            .describe('Structure information object'),
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
        `Getting info for StructKit ${structFile ? `file: ${structFile}` : `structure: ${structure}`}`,
      );

      const args: string[] = ['info'];

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
            ctx.logger.info('StructKit info completed successfully');
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
        const info = JSON.parse(stdout);
        ctx.output('info', info);
      } catch (error) {
        ctx.logger.warn(
          `Failed to parse JSON output, returning raw stdout: ${error}`,
        );
        ctx.output('info', { raw: stdout });
      }
    },
  });
}
