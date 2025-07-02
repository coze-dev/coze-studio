import {type DependencyList} from 'react';
import type React from 'react';
import { useState, useCallback, useRef, useLayoutEffect } from 'react';

interface Options {
  onEnter?: () => void
  onLeave?: () => void
}

const useHover = <T extends HTMLElement = any>(
  el?: T | (() => T),
  options: Options = {},
  deps: DependencyList = [],
): [React.MutableRefObject<T>, boolean] => {
  const {  onEnter, onLeave } = options
  const ref = useRef<T>();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (onEnter) {onEnter()}
    setIsHovered(true)
  }, [typeof onEnter  === 'function']);
  const handleMouseLeave = useCallback(() => {
    if (onLeave) {onLeave()}
    setIsHovered(false)
  }, [typeof onLeave  === 'function']);

  useLayoutEffect(() => {
    let target = ref.current
    if (el) {
      target = typeof el === 'function' ? el() : el;
    }
    if (!target) {return}
    target.addEventListener('mouseenter', handleMouseEnter);
    target.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      target?.removeEventListener('mouseenter', handleMouseEnter);
      target?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref.current, typeof el === 'function' ? undefined : el, ...deps]);

  return [ref as React.MutableRefObject<T>, isHovered];
};

export default useHover;
