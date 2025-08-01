/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
