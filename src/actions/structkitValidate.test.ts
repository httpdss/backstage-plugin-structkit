import { createStructKitValidateAction } from './structkitValidate';
import { PassThrough } from 'stream';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

describe('structkit:validate', () => {
  const action = createStructKitValidateAction();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct id', () => {
    expect(action.id).toBe('structkit:validate');
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
      input: {},
    };

    await expect(action.handler(mockContext as any)).rejects.toThrow(
      'Either "structure" or "structFile" input is required',
    );
  });

  it('should have valid and errors output schema', () => {
    const outputSchema = action.schema?.output;
    expect(outputSchema).toBeDefined();
  });
});
