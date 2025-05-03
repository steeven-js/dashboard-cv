import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * A wrapper around MUI DatePicker that properly handles null/invalid values
 * and prevents "value.isValid is not a function" errors
 */
export function SafeDatePicker({ value, onChange, format = 'DD/MM/YYYY', ...props }) {
  // Keep internal state for safety
  const [internalValue, setInternalValue] = useState(null);

  // Validate and sync the external value
  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        setInternalValue(null);
      } else if (dayjs.isDayjs(value)) {
        setInternalValue(value.isValid() ? value : null);
      } else {
        const dayjsValue = dayjs(value);
        setInternalValue(dayjsValue.isValid() ? dayjsValue : null);
      }
    } catch (error) {
      console.error('Error processing date value:', error);
      setInternalValue(null);
    }
  }, [value]);

  // Safe change handler
  const handleChange = (newValue) => {
    try {
      if (newValue === null || newValue === undefined) {
        setInternalValue(null);
        if (onChange) onChange(null);
      } else if (dayjs.isDayjs(newValue)) {
        if (newValue.isValid()) {
          setInternalValue(newValue);
          if (onChange) onChange(newValue);
        } else {
          setInternalValue(null);
          if (onChange) onChange(null);
        }
      } else {
        const dayjsValue = dayjs(newValue);
        if (dayjsValue.isValid()) {
          setInternalValue(dayjsValue);
          if (onChange) onChange(dayjsValue);
        } else {
          setInternalValue(null);
          if (onChange) onChange(null);
        }
      }
    } catch (error) {
      console.error('Error in SafeDatePicker handleChange:', error);
      setInternalValue(null);
      if (onChange) onChange(null);
    }
  };

  // Default slots with clear functionality
  const defaultSlotProps = {
    field: {
      clearable: true,
      onClear: () => handleChange(null),
    },
  };

  // Merge props with defaults
  const slotProps = {
    ...defaultSlotProps,
    ...props.slotProps,
  };

  return (
    <DatePicker
      value={internalValue}
      onChange={handleChange}
      format={format}
      slotProps={slotProps}
      {...props}
    />
  );
}

SafeDatePicker.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  format: PropTypes.string,
  slotProps: PropTypes.object,
};
