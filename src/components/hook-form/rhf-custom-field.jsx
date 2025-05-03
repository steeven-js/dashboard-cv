import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';

// ----------------------------------------------------------------------

export function RHFCustomField({ name, component: Component, helperText, label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Component
          {...field}
          label={label}
          helperText={error?.message ?? helperText}
          error={!!error}
          {...other}
        />
      )}
    />
  );
}

RHFCustomField.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
  helperText: PropTypes.node,
  label: PropTypes.string,
}; 