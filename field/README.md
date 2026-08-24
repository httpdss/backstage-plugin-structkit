# @httpdss/plugin-scaffolder-field-structkit

A custom Backstage scaffolder field for selecting [StructKit](https://structkit.dev) structures.

## Installation

```bash
yarn --cwd packages/app add @httpdss/plugin-scaffolder-field-structkit
```

## Setup

Register the custom field in your Backstage app:

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

## Usage

### Basic Usage with Static Structures

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: my-template
  title: My Template
spec:
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

### Advanced: Dynamic Structure Loading

Use the `structkit:list` action in a previous step to fetch structures dynamically:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: dynamic-template
  title: Dynamic Template
spec:
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

    - id: vars
      name: Get Structure Variables
      action: structkit:vars
      input:
        structure: ${{ parameters.structure }}

    - id: generate
      name: Generate Structure
      action: structkit:generate
      input:
        structure: ${{ parameters.structure }}
        vars:
          project_name: ${{ parameters.name }}
```

### Allow Custom Structure Names

Enable users to type custom structure names:

```yaml
parameters:
  - title: Choose Structure
    properties:
      structure:
        title: StructKit Structure
        type: string
        ui:field: StructKitPicker
        ui:options:
          allowCustom: true
```

## Field Options

| Option | Type | Description |
|--------|------|-------------|
| `structures` | array | Array of structure objects with `name` and optional `description` |
| `allowCustom` | boolean | If true, allows typing custom structure names (default: false) |

## License

MIT
