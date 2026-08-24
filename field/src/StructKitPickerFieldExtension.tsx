import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';

/**
 * Props for the StructKitPickerFieldExtension component
 *
 * @public
 */
export interface StructKitPickerFieldExtensionProps {
  onChange: (value: string) => void;
  rawErrors?: string[];
  required?: boolean;
  formData?: string;
  schema: {
    title?: string;
    description?: string;
  };
  uiSchema?: {
    'ui:options'?: {
      structures?: Array<{ name: string; description?: string }>;
      allowCustom?: boolean;
    };
  };
}

/**
 * A custom Backstage scaffolder field for selecting StructKit structures.
 *
 * @remarks
 * This field displays a dropdown of StructKit structures. Structures can be:
 * - Provided statically via ui:options.structures
 * - Fetched dynamically (requires structures to be passed from a previous step)
 *
 * When allowCustom is true, users can type a custom structure name instead of
 * selecting from the dropdown.
 *
 * @public
 */
export const StructKitPickerFieldExtension = (
  props: StructKitPickerFieldExtensionProps,
) => {
  const { onChange, rawErrors, required, formData, schema, uiSchema } = props;

  const structures = uiSchema?.['ui:options']?.structures || [];
  const allowCustom = uiSchema?.['ui:options']?.allowCustom || false;

  const handleChange = (
    event: React.ChangeEvent<{ value: unknown } | HTMLInputElement>,
  ) => {
    onChange(event.target.value as string);
  };

  if (allowCustom) {
    return (
      <TextField
        label={schema.title || 'StructKit Structure'}
        helperText={
          schema.description ||
          'Enter a structure name or select from suggestions'
        }
        required={required}
        value={formData || ''}
        onChange={handleChange}
        error={rawErrors && rawErrors.length > 0}
        margin="normal"
        fullWidth
      />
    );
  }

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors && rawErrors.length > 0}
      fullWidth
    >
      <InputLabel>{schema.title || 'StructKit Structure'}</InputLabel>
      <Select value={formData || ''} onChange={handleChange}>
        {structures.length === 0 && (
          <MenuItem value="" disabled>
            No structures available
          </MenuItem>
        )}
        {structures.map(structure => (
          <MenuItem key={structure.name} value={structure.name}>
            {structure.name}
            {structure.description && ` - ${structure.description}`}
          </MenuItem>
        ))}
      </Select>
      {schema.description && (
        <FormHelperText>{schema.description}</FormHelperText>
      )}
      {rawErrors && rawErrors.length > 0 && (
        <FormHelperText error>{rawErrors.join(', ')}</FormHelperText>
      )}
    </FormControl>
  );
};
