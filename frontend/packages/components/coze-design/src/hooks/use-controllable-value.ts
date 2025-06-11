import { useState, useEffect } from 'react';

/**
 * A custom hook for handling controlled/uncontrolled component values
 * @param props - The component props containing value, defaultValue and onChange
 * @returns A tuple containing the current value and a change handler
 */
export const useControllableValue = <T, R extends unknown[] = unknown[]>(
  props: {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T, ...args: R) => void;
  },
  hasValue?: boolean,
) => {
  const [innerValue, setInnerValue] = useState<T | undefined>(() =>
    props.value !== undefined ? props.value : props.defaultValue,
  );

  useEffect(() => {
    if (props.value !== undefined) {
      setInnerValue(props.value);
    }
  }, [props.value]);

  const handleChange = (v: T, ...args: R) => {
    if (props.value === undefined) {
      setInnerValue(v);
    }
    props.onChange?.(v, ...args);
  };

  const isControlled = Boolean(hasValue === undefined ? props.value : hasValue);
  return [isControlled ? props.value : innerValue, handleChange] as const;
};
