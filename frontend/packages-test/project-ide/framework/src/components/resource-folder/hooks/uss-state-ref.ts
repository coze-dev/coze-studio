import { useRef, useState } from 'react';

const useStateRef = <T>(
  v: T,
  cb?: (v: T) => void,
): [React.MutableRefObject<T>, (v: T) => void, T] => {
  const [state, setState] = useState<T>(v);
  const ref = useRef<T>(v);

  const onChange = (nextV: T) => {
    ref.current = nextV;
    setState(nextV);
    cb?.(nextV);
  };

  return [ref, onChange, state];
};

export { useStateRef };
