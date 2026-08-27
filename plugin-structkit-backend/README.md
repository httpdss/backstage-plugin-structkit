# @httpdss/plugin-structkit-backend

A [Backstage](https://backstage.io) backend plugin for [StructKit](https://structkit.dev) that provides validation API for the catalog plugin.

## What This Provides

This backend plugin adds:

- **Validation API**: Endpoint for validating StructKit structures
- **CLI Integration**: Invokes the `structkit` CLI to perform validation
- **JSON Output**: Returns structured validation results

## Prerequisites

### StructKit CLI Required

The `structkit` CLI **must be installed** and available on the PATH of the Backstage backend host.

Install StructKit:

```bash
# Using npm
npm install -g structkit

# Using yarn
yarn global add structkit

# Verify installation
structkit --version
```

## Installation

### 1. Install the Package

From your Backstage root directory:

```bash
yarn --cwd packages/backend add @httpdss/plugin-structkit-backend
```

### 2. Register the Plugin

For the **new backend system** (recommended), add the plugin to your backend:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins ...

backend.add(import('@httpdss/plugin-structkit-backend'));

backend.start();
```

### 3. (Optional) Configure Custom Binary Path

If `structkit` is not in PATH, configure it in `app-config.yaml`:

```yaml
structkit:
  binaryPath: /custom/path/to/structkit
```

This configuration is shared with the scaffolder backend module.

### 4. Verify Installation

The plugin registers at `/api/structkit`. You can verify it's running:

```bash
curl -X POST http://localhost:7007/api/structkit/validate \
  -H "Content-Type: application/json" \
  -d '{"structure": "project/python"}'
```

## API Endpoints

### POST `/api/structkit/validate`

Validates a StructKit structure.

#### Request Body

```json
{
  "structure": "project/python"
}
```

Or with a custom structure file:

```json
{
  "structFile": "./my-structure.yaml"
}
```

**Parameters**:

- `structure` (string, optional): Named structure to validate
- `structFile` (string, optional): Path to custom structure file

At least one of `structure` or `structFile` is required.

#### Response

Success (structure is valid):

```json
{
  "valid": true
}
```

Failure (structure has errors):

```json
{
  "valid": false,
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

#### Status Codes

- `200 OK`: Validation completed (check `valid` field in response)
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: Server error (e.g., structkit CLI not found)

## Usage with Frontend Plugin

This backend plugin is designed to work with the frontend catalog plugin `@httpdss/plugin-structkit`.

The frontend plugin's `StructKitCard` component calls this API when users click the "Validate Structure" button.

See the [frontend plugin README](../plugin-structkit/README.md) for setup instructions.

## Configuration

### Binary Path

Configure the path to the `structkit` binary in `app-config.yaml`:

```yaml
structkit:
  binaryPath: /custom/path/to/structkit  # Optional, defaults to 'structkit' on PATH
```

This is shared with the scaffolder backend module configuration.

## Development

### Building

```bash
yarn install
yarn build
```

### Testing

```bash
yarn test
```

### Linting

```bash
yarn lint
```

## Security Considerations

- The plugin runs the `structkit` CLI on the backend host
- Input validation is performed using Zod schemas
- The plugin uses `spawn()` with argv arrays (never shell execution)
- Structure names and file paths are passed as arguments to prevent injection

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.

## Links

- [StructKit Documentation](https://structkit.dev)
- [Frontend Plugin](../plugin-structkit/)
- [Backstage Backend System](https://backstage.io/docs/backend-system/)
