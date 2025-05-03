import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export function RHFAutocomplete({ name, label, slotProps, helperText, placeholder, getOptionLabel, multiple, ...other }) {
  const { control, setValue } = useFormContext();

  const { textfield, ...otherSlotProps } = slotProps ?? {};

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // S'assurer que la valeur est un tableau si l'autocomplete est multiple
        const value = multiple && !Array.isArray(field.value) ? [] : field.value;
        
        return (
          <Autocomplete
            {...field}
            value={value}
            multiple={multiple}
            id={`rhf-autocomplete-${name}`}
            onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
            getOptionLabel={(option) => {
              if (getOptionLabel) return getOptionLabel(option);
              // Si l'option est une chaîne de caractères, la retourner directement
              if (typeof option === 'string') return option;
              // Si l'option est un objet avec une propriété label ou name, la retourner
              if (option && typeof option === 'object') {
                if (option.label) return option.label;
                if (option.name) return option.name;
              }
              // Valeur par défaut pour éviter l'erreur
              return '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...textfield}
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error?.message ?? helperText}
                slotProps={{
                  ...textfield?.slotProps,
                  htmlInput: {
                    ...params.inputProps,
                    autoComplete: 'new-password',
                    ...textfield?.slotProps?.htmlInput,
                  },
                }}
              />
            )}
            {...other}
            {...otherSlotProps}
          />
        );
      }}
    />
  );
}
