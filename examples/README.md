# Examples

This directory contains example Backstage software templates demonstrating the `structkit:generate` action.

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
