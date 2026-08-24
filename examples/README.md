# Examples

This directory contains example Backstage software templates demonstrating StructKit scaffolder actions and the custom field extension.

## Templates

### `template.yaml`

A complete example template that:
1. Fetches a skeleton directory with basic files
2. Runs StructKit to generate project structure
3. Publishes to GitHub
4. Registers the component in Backstage catalog

**Usage**: Copy this template to your Backstage instance's template directory (e.g., `examples/templates/`) and modify to suit your needs.

### `custom-file-template.yaml`

An example showing how to use a custom StructKit structure file instead of a named structure:
1. Fetches a custom structure YAML file
2. Runs StructKit with the custom file
3. Publishes to GitHub

**Usage**: This demonstrates the `structFile` parameter. Create your own structure files and reference them in templates.

### `dynamic-template.yaml` (NEW)

A comprehensive example showcasing all StructKit actions and the custom field extension:
1. Lists available structures dynamically with `structkit:list`
2. Uses the `StructKitPicker` custom field for structure selection
3. Validates the selected structure with `structkit:validate`
4. Queries required variables with `structkit:vars`
5. Generates the project with `structkit:generate`
6. Publishes to GitHub and registers in catalog

**Usage**: This is the recommended starting point for new templates. It demonstrates the complete StructKit integration including the frontend picker field.

## Testing Templates Locally

To test these templates in your Backstage instance:

1. Copy the template YAML to your templates directory:
   ```bash
   cp examples/template.yaml /path/to/backstage/examples/templates/structkit-example/template.yaml
   ```

2. Register the template location in your `app-config.yaml`:
   ```yaml
   catalog:
     locations:
       - type: file
         target: examples/templates/structkit-example/template.yaml
   ```

3. Restart Backstage and navigate to "Create" to see your template.

## Customizing

Key customization points:
- **Structure name**: Change the `structure` parameter to use different StructKit structures
- **Variables**: Add more template parameters and map them to StructKit vars
- **Hooks**: Set `noHooks: false` if your structure has safe post-generation hooks
- **Output path**: Generate into a subdirectory using `outputPath`

For more information, see the [main README](../README.md).
