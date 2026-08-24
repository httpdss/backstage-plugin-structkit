# @httpdss/plugin-scaffolder-backend-module-structkit

A [Backstage](https://backstage.io) scaffolder backend module that provides a custom action for generating code from [StructKit](https://structkit.dev) YAML structure files.

## What This Is

This plugin adds a `structkit:generate` action to Backstage software templates, allowing template authors to:
- Pick a StructKit structure (by name or custom file)
- Pass template variables
- Generate files into the workspace
- Chain with other actions (typically `publish:github`)

## What This Is NOT

- ❌ **No frontend marketplace**: This does not provide a UI for browsing StructKit structures
- ❌ **No catalog integration**: No entity page, no component visualization
- ❌ **Not a standalone plugin**: This is a scaffolder *action module*, not a full plugin

Future enhancements may add frontend components and catalog integration.

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
yarn --cwd packages/backend add @httpdss/plugin-scaffolder-backend-module-structkit
```

### 2. Register the Module

For the **new backend system** (recommended), add the module to your backend:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins ...

backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(
  import('@httpdss/plugin-scaffolder-backend-module-structkit'),
);

backend.start();
```

### 3. Verify Installation

Check that the action is available:
```bash
# In your Backstage app directory
yarn backstage-cli info --actions | grep structkit
```

You should see `structkit:generate` in the list of available actions.

## Usage

### Action: `structkit:generate`

#### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `structure` | string | * | - | Name of the StructKit structure to generate (e.g., `"nextjs-app"`) |
| `structFile` | string | * | - | Path to a custom structure YAML file (alternative to `structure`) |
| `outputPath` | string | No | `"."` | Relative path within the workspace where files should be generated |
| `vars` | object | No | `{}` | Variables to pass to the structure template |
| `dryRun` | boolean | No | `false` | If true, shows what would be generated without writing files |
| `noHooks` | boolean | No | `true` | If true, skips running post-generation hooks (default true for safety) |
| `extraArgs` | string[] | No | `[]` | Additional CLI arguments to pass to structkit |

\* Either `structure` or `structFile` is required (but not both).

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| `filesGenerated` | number | Number of files generated (when available from CLI output) |

### Example Template

Basic example using a named structure:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-app-template
  title: My App Template
  description: Create a new app with StructKit
spec:
  owner: platform-team
  type: service

  parameters:
    - title: Project Information
      required:
        - name
      properties:
        name:
          title: Name
          type: string

  steps:
    - id: structkit-generate
      name: Generate Project Structure
      action: structkit:generate
      input:
        structure: nextjs-app
        outputPath: .
        vars:
          project_name: ${{ parameters.name }}
        noHooks: true

    - id: publish
      name: Publish to GitHub
      action: publish:github
      input:
        allowedHosts: ['github.com']
        description: Generated with StructKit
        repoUrl: ${{ parameters.repoUrl }}

  output:
    links:
      - title: Repository
        url: ${{ steps.publish.output.remoteUrl }}
```

See the [examples/](./examples) directory for more complete examples, including:
- [`template.yaml`](./examples/template.yaml) - Full template with catalog registration
- [`custom-file-template.yaml`](./examples/custom-file-template.yaml) - Using a custom structure file

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

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.

## Links

- [StructKit Documentation](https://structkit.dev)
- [Backstage Software Templates](https://backstage.io/docs/features/software-templates/)
- [Writing Custom Actions](https://backstage.io/docs/features/software-templates/writing-custom-actions/)
