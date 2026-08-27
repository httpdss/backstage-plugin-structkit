# @httpdss/plugin-structkit

A [Backstage](https://backstage.io) catalog plugin for [StructKit](https://structkit.dev) that displays structure information on entity pages.

## What This Provides

This plugin adds a catalog entity card that:

- Displays which StructKit structure generated a component
- Shows structure metadata and documentation links
- Provides drift detection via validation checks
- Integrates seamlessly with the Backstage catalog

## Features

- **Entity Card**: Displays StructKit structure information on Component and Resource pages
- **Annotations Support**: Reads structure information from catalog entity annotations
- **Validation**: Validates structures against their definitions (requires backend plugin)
- **EntitySwitch Support**: Conditional rendering based on StructKit annotations

## Prerequisites

### Required Annotations

Entities must have at least one of these annotations in their `catalog-info.yaml`:

- `structkit.io/structure` - Named structure (e.g., `"project/python"`)
- `structkit.io/struct-file` - Path to custom structure file (e.g., `"./my-structure.yaml"`)

Optional annotations:

- `structkit.io/source` - Source reference or description

### Backend Plugin

For validation features, install the backend plugin:

```bash
yarn --cwd packages/backend add @httpdss/plugin-structkit-backend
```

See the [backend plugin README](../plugin-structkit-backend/README.md) for setup instructions.

## Installation

### 1. Install the Package

From your Backstage root directory:

```bash
yarn --cwd packages/app add @httpdss/plugin-structkit
```

### 2. Add the Card to Entity Pages

Edit your `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { StructKitCard, isStructkitAvailable } from '@httpdss/plugin-structkit';
import { EntitySwitch } from '@backstage/plugin-catalog';

// Inside your Component or Resource entity page:
const overviewContent = (
  <Grid container spacing={3}>
    {/* ... other cards ... */}

    <EntitySwitch>
      <EntitySwitch.Case if={isStructkitAvailable}>
        <Grid item md={6}>
          <StructKitCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </Grid>
);
```

### 3. Add Annotations to Entities

Add annotations to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    structkit.io/structure: project/python
    structkit.io/source: Generated from template
spec:
  type: service
  lifecycle: production
  owner: team-name
```

Or for custom structure files:

```yaml
metadata:
  annotations:
    structkit.io/struct-file: ./my-structure.yaml
```

## Usage with Scaffolder Templates

To automatically add annotations when creating components via templates, add a catalog write step:

```yaml
steps:
  - id: structkit-generate
    name: Generate Project Structure
    action: structkit:generate
    input:
      structure: ${{ parameters.structure }}
      vars:
        project_name: ${{ parameters.name }}

  - id: publish
    name: Publish to GitHub
    action: publish:github
    input:
      repoUrl: ${{ parameters.repoUrl }}
      description: ${{ parameters.description }}

  - id: register
    name: Register Component
    action: catalog:register
    input:
      repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
      catalogInfoPath: '/catalog-info.yaml'
```

Update your `catalog-info.yaml` template to include the annotation:

```yaml
# examples/skeleton/catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${{ values.name }}
  annotations:
    structkit.io/structure: ${{ values.structure }}
spec:
  type: service
  lifecycle: experimental
  owner: ${{ values.owner }}
```

## API Reference

### Components

#### `StructKitCard`

The main entity card component that displays StructKit information.

**Props**: None (uses `useEntity()` hook internally)

**Usage**:

```typescript
import { StructKitCard } from '@httpdss/plugin-structkit';

<StructKitCard />
```

### Helpers

#### `isStructkitAvailable(entity: Entity): boolean`

Check if an entity has StructKit annotations. Use with `EntitySwitch` for conditional rendering.

**Parameters**:

- `entity` - Backstage catalog entity

**Returns**: `true` if entity has `structkit.io/structure` or `structkit.io/struct-file` annotation

**Usage**:

```typescript
import { isStructkitAvailable } from '@httpdss/plugin-structkit';
import { EntitySwitch } from '@backstage/plugin-catalog';

<EntitySwitch>
  <EntitySwitch.Case if={isStructkitAvailable}>
    <StructKitCard />
  </EntitySwitch.Case>
</EntitySwitch>
```

### Constants

#### Annotations

```typescript
import {
  STRUCTKIT_ANNOTATION_STRUCTURE,     // 'structkit.io/structure'
  STRUCTKIT_ANNOTATION_STRUCT_FILE,   // 'structkit.io/struct-file'
  STRUCTKIT_ANNOTATION_SOURCE,        // 'structkit.io/source'
} from '@httpdss/plugin-structkit';
```

## Annotations Reference

| Annotation | Required | Description | Example |
|------------|----------|-------------|---------|
| `structkit.io/structure` | Yes* | Named StructKit structure | `project/python` |
| `structkit.io/struct-file` | Yes* | Custom structure file path | `./my-structure.yaml` |
| `structkit.io/source` | No | Source reference or description | `Generated from template` |

\* At least one of `structure` or `struct-file` is required.

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
- [Backstage Catalog](https://backstage.io/docs/features/software-catalog/)
- [Backend Plugin](../plugin-structkit-backend/)
