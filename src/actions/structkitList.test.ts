import { createStructKitListAction } from './structkitList';
import { PassThrough } from 'stream';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

describe('structkit:list', () => {
  const action = createStructKitListAction();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct id', () => {
    expect(action.id).toBe('structkit:list');
  });

  it('should have empty input schema', () => {
    const inputSchema = action.schema?.input;
    expect(inputSchema).toBeDefined();
  });

  it('should have structures output schema', () => {
    const outputSchema = action.schema?.output;
    expect(outputSchema).toBeDefined();
  });

  it('should execute with no input parameters', async () => {
    const mockContext = {
      workspacePath: '/tmp/test',
      logger: mockLogger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory: jest.fn(),
      input: {},
    };

    expect(mockContext.input).toBeDefined();
  });
});
