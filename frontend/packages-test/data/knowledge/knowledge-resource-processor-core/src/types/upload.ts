import { type ReactNode } from 'react';

/**
 * types for upload
 */
import { type StoreApi, type UseBoundStore } from 'zustand';

import {
  type OptType,
  type FooterBtnStatus,
  type CheckedStatus,
} from '../constants';

export interface ContentProps<T> {
  useStore: UseBoundStore<StoreApi<T>>;
  footer?: (
    controls: FooterControlsProps | FooterBtnProps[],
  ) => React.ReactElement;
  opt?: OptType;
  checkStatus: CheckedStatus | undefined;
}

export type FooterControlsProps = FooterControlProp | FooterBtnProps[];

export type FooterPrefixType = React.ReactElement | string | undefined;

export interface FooterControlProp {
  prefix: FooterPrefixType;
  btns: FooterBtnProps[];
}

export interface FooterBtnProps {
  e2e?: string;
  onClick: () => void;
  text: string;
  status?: FooterBtnStatus;
  theme?: 'solid' | 'borderless' | 'light';
  type?: 'hgltplus' | 'primary' | 'secondary' | 'yellow' | 'red' | 'green';
  disableHoverContent?: ReactNode;
}
