import { useState, useRef, useLayoutEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- x
type Destructor = (() => void) | void;
type Fn<ARGS extends unknown[]> = (...args: ARGS) => Destructor;

export const useImperativeLayoutEffect = <Params extends unknown[]>(
  effect: Fn<Params>,
  deps: unknown[] = [],
) => {
  const [effectValue, setEffectValue] = useState(0);
  const paramRef = useRef<Params>();
  const effectRef = useRef<Fn<Params>>(() => undefined);
  effectRef.current = effect;
  useLayoutEffect(() => {
    if (!effectValue) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 体操不动, 凑活用吧
    // @ts-expect-error
    const params = paramRef.current || ([] as Params);
    return effectRef.current(...params);
  }, [effectValue, ...deps]);
  return (...args: Params) => {
    paramRef.current = args;
    setEffectValue(pre => pre + 1);
  };
};
