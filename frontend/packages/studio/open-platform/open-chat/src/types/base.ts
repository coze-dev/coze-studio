import { type ReactNode } from 'react';

export enum Layout {
  PC = 'pc',
  MOBILE = 'mobile',
}

export interface HeaderConfig {
  isShow?: boolean; //是否显示header， 默认是true
  isNeedClose?: boolean; //是否需要关闭按钮， 默认是true
  extra?: ReactNode | false; // 用于站位的，默认无
}

export interface DebugProps {
  cozeApiRequestHeader?: Record<string, string>;
}
