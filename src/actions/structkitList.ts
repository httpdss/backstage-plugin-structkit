import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { z } from 'zod';
import { Config } from '@backstage/config';

/**
 * Creates a StructKit list action.
 *
 * @remarks
 * This action lists all available StructKit structures.
 * The structkit CLI must be available on the PATH of the Backstage backend host.
 *
 * @public
 */
export function createStructKitListAction(options?: { config?: Config }) {
  const structkitBinary =
    options?.config?.getOptionalString('structkit.binaryPath') ?? 'structkit';

  return createTemplateAction({
    id: 'structkit:list',
    description: 'Lists all available StructKit structures',
    schema: {
      input: {},
      output: {
        structures: z =>
          z
            .array(
              z.object({
                name: z.string(),
                description: z.string().optional(),
              }),
            )
            .describe('Array of available structures'),
      },
    },

    async handler(ctx) {
      ctx.logger.info('Listing available StructKit structures');

      const args: string[] = ['list', '--format', 'json'];

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
            ctx.logger.info('StructKit list completed successfully');
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
        const structures = JSON.parse(stdout);
        ctx.output('structures', structures);
        ctx.logger.info(`Found ${structures.length} structures`);
      } catch (error) {
        ctx.logger.warn(
          `Failed to parse JSON output, returning raw stdout: ${error}`,
        );
        ctx.output('structures', []);
      }
    },
  });
}
