import { useState, useMemo } from 'react';

export interface ReturnValue {
  state: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: (value?: boolean) => void;
}

export default (initialValue?: boolean): ReturnValue => {
  const [state, setState] = useState(Boolean(initialValue));

  const stateMethods = useMemo(() => {
    const setTrue = () => setState(true);
    const setFalse = () => setState(false);
    const toggle = (val?: boolean) =>
      setState(typeof val === 'boolean' ? val : s => !s);
    return {
      setTrue,
      setFalse,
      toggle,
    };
  }, []);

  return {
    state,
    ...stateMethods,
  };
};
