import { useState, useRef, type Dispatch, type SetStateAction, useCallback } from 'react';

const isFunction = (val: any): val is Function => typeof val === 'function';

// 获取新的状态值，兼容传值和传函数情况
function getStateVal<T>(preState: T, initVal?: SetStateAction<T>): T | undefined {
  if (isFunction(initVal)) {
    return initVal(preState);
  }
  return initVal;
}

function useStateRealtime<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>, () => T]
function useStateRealtime<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => T | undefined]
function useStateRealtime<T>(
  initVal?: T | (() => T),
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => T | undefined] {
  const initState = getStateVal(undefined, initVal);
  const [val, setVal] = useState(initState);
  const valRef = useRef(initState);
  const setState = useCallback((newVal?: SetStateAction<T | undefined>) => {
    const newState = getStateVal(valRef.current, newVal);
    valRef.current = newState;
    setVal(newState);
  }, [])
  const getRealState = useCallback(() => valRef.current, [])
  return [val, setState, getRealState];
}

export default useStateRealtime;
