export type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;

import { type CSSProperties } from 'react';

export type WithCustomStyle<T = object> = {
  className?: string;
  style?: CSSProperties;
} & T;
