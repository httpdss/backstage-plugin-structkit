import { createStructKitGenerateAction } from './structkitGenerate';
import { PassThrough } from 'stream';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

describe('structkit:generate', () => {
  const action = createStructKitGenerateAction();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct id', () => {
    expect(action.id).toBe('structkit:generate');
  });

  it('should validate input schema - structure name', () => {
    const inputSchema = action.schema?.input;
    expect(inputSchema).toBeDefined();
  });

  it('should validate input schema - struct file', () => {
    const inputSchema = action.schema?.input;
    expect(inputSchema).toBeDefined();
  });

  it('should require either structure or structFile', async () => {
    const mockContext = {
      workspacePath: '/tmp/test',
      logger: mockLogger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory: jest.fn(),
      input: {
        outputPath: '.',
        noHooks: true,
        dryRun: false,
      },
    };

    await expect(action.handler(mockContext as any)).rejects.toThrow(
      'Either "structure" or "structFile" input is required',
    );
  });

  it('should build correct args for structure name', () => {
    const input = {
      structure: 'nextjs-app',
      outputPath: './output',
      vars: {
        project_name: 'my-app',
        version: '1.0.0',
      },
      dryRun: false,
      noHooks: true,
    };

    const expectedArgs = [
      'generate',
      'nextjs-app',
      '--output',
      expect.stringContaining('output'),
      '--var',
      'project_name=my-app',
      '--var',
      'version=1.0.0',
      '--no-hooks',
    ];

    expect(expectedArgs).toContain('generate');
    expect(expectedArgs).toContain('nextjs-app');
    expect(expectedArgs).toContain('--no-hooks');
  });

  it('should build correct args for struct file', () => {
    const input = {
      structFile: './my-structure.yaml',
      outputPath: '.',
      noHooks: false,
      dryRun: true,
    };

    const expectedArgs = [
      'generate',
      '--struct-file',
      './my-structure.yaml',
      '--output',
      expect.any(String),
      '--dry-run',
    ];

    expect(expectedArgs).toContain('--struct-file');
    expect(expectedArgs).toContain('--dry-run');
  });

  it('should include extra args when provided', () => {
    const input = {
      structure: 'test',
      outputPath: '.',
      extraArgs: ['--verbose', '--force'],
      noHooks: true,
    };

    const expectedArgs = [
      'generate',
      'test',
      '--output',
      expect.any(String),
      '--no-hooks',
      '--verbose',
      '--force',
    ];

    expect(expectedArgs).toContain('--verbose');
    expect(expectedArgs).toContain('--force');
  });
});
