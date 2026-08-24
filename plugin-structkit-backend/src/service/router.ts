import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { spawn } from 'child_process';
import { z } from 'zod';

const validateRequestSchema = z.object({
  structure: z.string().optional(),
  structFile: z.string().optional(),
}).refine(
  data => data.structure || data.structFile,
  {
    message: 'Either structure or structFile must be provided',
  }
);

interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

function getBinaryPath(config: Config): string {
  return config.getOptionalString('structkit.binaryPath') || 'structkit';
}

async function runStructkitValidate(
  binaryPath: string,
  structure?: string,
  structFile?: string,
): Promise<{ valid: boolean; errors?: string[] }> {
  return new Promise((resolve, reject) => {
    const args = ['validate'];

    if (structure) {
      args.push(structure);
    } else if (structFile) {
      args.push(structFile);
    }

    args.push('--format', 'json');

    const child = spawn(binaryPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code: number) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          resolve({ valid: true });
        }
      } else {
        try {
          const result = JSON.parse(stdout || stderr);
          resolve(result);
        } catch (error) {
          resolve({
            valid: false,
            errors: [stderr || `Validation failed with exit code ${code}`],
          });
        }
      }
    });

    child.on('error', (error: Error) => {
      reject(new Error(`Failed to run structkit: ${error.message}`));
    });
  });
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const binaryPath = getBinaryPath(config);

  const router = Router();
  router.use(express.json());

  router.post('/validate', async (req, res) => {
    try {
      const body = validateRequestSchema.parse(req.body);

      logger.info(`Validating structure: ${body.structure || body.structFile}`);

      const result = await runStructkitValidate(
        binaryPath,
        body.structure,
        body.structFile,
      );

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          valid: false,
          errors: error.errors.map(e => e.message),
        });
      } else {
        logger.error(`Validation error: ${error}`);
        res.status(500).json({
          valid: false,
          errors: [
            error instanceof Error ? error.message : 'Unknown error occurred',
          ],
        });
      }
    }
  });

  return router;
}
