import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { z } from 'zod';
import { Config } from '@backstage/config';

/**
 * Creates a StructKit validate action.
 *
 * @remarks
 * This action validates a StructKit structure file.
 * The structkit CLI must be available on the PATH of the Backstage backend host.
 *
 * @public
 */
export function createStructKitValidateAction(options?: { config?: Config }) {
  const structkitBinary =
    options?.config?.getOptionalString('structkit.binaryPath') ?? 'structkit';

  return createTemplateAction({
    id: 'structkit:validate',
    description: 'Validates a StructKit structure file',
    schema: {
      input: {
        structure: z =>
          z
            .string({
              description:
                'Name of the structure to validate (e.g., "nextjs-app")',
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
        valid: z => z.boolean().describe('Whether the structure is valid'),
        errors: z =>
          z
            .array(z.string())
            .describe('Array of validation error messages')
            .optional(),
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
        `Validating StructKit ${structFile ? `file: ${structFile}` : `structure: ${structure}`}`,
      );

      const args: string[] = ['validate'];

      if (structFile) {
        args.push('--struct-file', structFile);
      } else if (structure) {
        args.push(structure);
      }

      args.push('--format', 'json');

      ctx.logger.info(`Executing: ${structkitBinary} ${args.join(' ')}`);

      let stdout = '';

      const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
        const child = spawn(structkitBinary, args, {
          cwd: ctx.workspacePath,
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stderr = '';
        let localStdout = '';

        child.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          localStdout += text;
        });

        child.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderr += text;
        });

        child.on('error', () => {
          resolve({ code: 1, stdout: localStdout, stderr });
        });

        child.on('close', (code: number | null) => {
          resolve({ code: code ?? 1, stdout: localStdout, stderr });
        });
      });

      stdout = result.stdout;

      if (result.code === 0) {
        ctx.logger.info('Structure validation passed');
        ctx.output('valid', true);
        ctx.output('errors', []);
      } else {
        ctx.logger.warn('Structure validation failed');
        ctx.output('valid', false);

        try {
          const errorData = JSON.parse(stdout);
          const errors = Array.isArray(errorData.errors)
            ? errorData.errors
            : [result.stderr || 'Validation failed'];
          ctx.output('errors', errors);
        } catch {
          ctx.output('errors', [result.stderr || 'Validation failed']);
        }
      }
    },
  });
}
