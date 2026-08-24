# backstage-plugin-structkit

A complete [Backstage](https://backstage.io) integration for [StructKit](https://structkit.dev), providing scaffolder actions, catalog integration, and UI extensions.

## Packages

This repository contains three packages:

### [@httpdss/plugin-scaffolder-backend-module-structkit](./README.md#backend-actions)
Scaffolder backend module with StructKit actions for software templates.

**Backend Actions:**
- `structkit:generate` - Generate code from structures
- `structkit:list` - List available structures
- `structkit:info` - Get structure details
- `structkit:vars` - Get required template variables
- `structkit:validate` - Validate structure files

### [@httpdss/plugin-scaffolder-field-structkit](./field/README.md)
Custom field extension for the scaffolder UI.

**Frontend Field Extension:**
- `StructKitPicker` - Custom field for selecting structures in template forms

### [@httpdss/plugin-structkit](./plugin-structkit/README.md)
Catalog plugin that displays StructKit entity cards.

**Catalog Integration:**
- Entity card showing structure information
- Validation and drift detection
- Documentation links
- EntitySwitch support with `isStructkitAvailable`

### [@httpdss/plugin-structkit-backend](./plugin-structkit-backend/README.md)
Backend plugin providing validation API for the catalog plugin.

**Backend API:**
- `/api/structkit/validate` endpoint
- CLI integration for validation

## What You Can Do

Template authors can:
- Pick structures from a dropdown
- Discover available structures dynamically
- Query required variables before generation
- Validate structures before use
- Generate files into the workspace

Entity owners can:
- See which StructKit structure generated their component
- Access documentation links
- Validate structures against their definitions
- Detect drift from original structure

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

### 3. (Optional) Configure Custom Binary Path

If `structkit` is not in PATH, configure it in `app-config.yaml`:

```yaml
structkit:
  binaryPath: /custom/path/to/structkit
```

### 4. (Optional) Install Frontend Field Extension

For the custom structure picker field:

```bash
yarn --cwd packages/app add @httpdss/plugin-scaffolder-field-structkit
```

Then register it in your app (see [Frontend Field Extension](#frontend-field-extension) below).

### 5. Verify Installation

Check that the actions are available:
```bash
# In your Backstage app directory
yarn backstage-cli info --actions | grep structkit
```

You should see all StructKit actions in the list.

## Backend Actions

### Action: `structkit:list`

Lists all available StructKit structures.

#### Input Parameters

None.

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| `structures` | array | Array of structure objects with `name` and optional `description` |

#### Example

```yaml
steps:
  - id: list-structures
    name: List Available Structures
    action: structkit:list
```

### Action: `structkit:info`

Retrieves detailed information about a specific structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `structure` | string | * | Name of the structure (e.g., `"nextjs-app"`) |
| `structFile` | string | * | Path to a custom structure file (alternative to `structure`) |

\* Either `structure` or `structFile` is required.

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| `info` | object | Structure information object |

#### Example

```yaml
steps:
  - id: get-info
    name: Get Structure Info
    action: structkit:info
    input:
      structure: nextjs-app
```

### Action: `structkit:vars`

Retrieves the required template variables for a structure.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `structure` | string | * | Name of the structure (e.g., `"nextjs-app"`) |
| `structFile` | string | * | Path to a custom structure file (alternative to `structure`) |

\* Either `structure` or `structFile` is required.

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| `vars` | array | Array of variable objects with `name`, `description`, `required`, and `default` |

#### Example

```yaml
steps:
  - id: get-vars
    name: Get Required Variables
    action: structkit:vars
    input:
      structure: ${{ parameters.structure }}
```

### Action: `structkit:validate`

Validates a StructKit structure file.

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `structure` | string | * | Name of the structure to validate |
| `structFile` | string | * | Path to a custom structure file (alternative to `structure`) |

\* Either `structure` or `structFile` is required.

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| `valid` | boolean | Whether the structure is valid |
| `errors` | array | Array of validation error messages (if invalid) |

#### Example

```yaml
steps:
  - id: validate-structure
    name: Validate Structure
    action: structkit:validate
    input:
      structFile: ./my-structure.yaml
```

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

## Frontend Field Extension

The `@httpdss/plugin-scaffolder-field-structkit` package provides a custom field for selecting StructKit structures in template forms.

### Installation

```bash
yarn --cwd packages/app add @httpdss/plugin-scaffolder-field-structkit
```

### Registration

```typescript
// packages/app/src/scaffolder/index.tsx
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
import { StructKitPickerFieldExtension } from '@httpdss/plugin-scaffolder-field-structkit';

export const scaffolderPlugin = ScaffolderPage.create({
  components: {
    FieldExtensions: (
      <ScaffolderFieldExtensions>
        <StructKitPickerFieldExtension />
      </ScaffolderFieldExtensions>
    ),
  },
});
```

### Usage in Templates

#### Basic Static Dropdown

```yaml
parameters:
  - title: Choose Structure
    properties:
      structure:
        title: StructKit Structure
        type: string
        ui:field: StructKitPicker
        ui:options:
          structures:
            - name: nextjs-app
              description: Next.js application
            - name: react-component
              description: React component library
```

#### Dynamic with structkit:list

```yaml
parameters:
  - title: Choose Structure
    properties:
      structure:
        title: StructKit Structure
        type: string
        ui:field: StructKitPicker
        ui:options:
          structures: ${{ steps.list.output.structures }}

steps:
  - id: list
    name: List Available Structures
    action: structkit:list
```

See the [field/README.md](./field/README.md) for complete field extension documentation.

## Examples

See the [examples/](./examples) directory for complete template examples:
- [`template.yaml`](./examples/template.yaml) - Full template with catalog registration
- [`custom-file-template.yaml`](./examples/custom-file-template.yaml) - Using a custom structure file
- [`dynamic-template.yaml`](./examples/dynamic-template.yaml) - Dynamic structure selection with custom field

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
