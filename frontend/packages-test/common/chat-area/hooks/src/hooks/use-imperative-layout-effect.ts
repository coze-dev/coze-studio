import { useState, useRef, useLayoutEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- x
type Destructor = (() => void) | void;
type Fn<ARGS extends unknown[]> = (...args: ARGS) => Destructor;

export const useImperativeLayoutEffect = <Params extends unknown[]>(
  effect: Fn<Params>,
) => {
  const [effectValue, setEffectValue] = useState(0);
  const paramRef = useRef<Params>();
  const effectRef = useRef<Fn<Params>>(() => undefined);
  effectRef.current = effect;
  useLayoutEffect(() => {
    if (!effectValue) {
      return;
    }
    // 经过一次运行后一定不为 undefined
    return paramRef.current && effectRef.current(...paramRef.current);
  }, [effectValue]);

  return (...args: Params) => {
    paramRef.current = args;
    setEffectValue(pre => pre + 1);
  };
};
