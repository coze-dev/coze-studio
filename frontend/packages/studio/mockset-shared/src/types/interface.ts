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

import { type CSSProperties } from 'react';

import {
  type OptionProps,
  type optionRenderProps,
} from '@coze-arch/bot-semi/Select';
import {
  type BizCtx,
  type MockSet,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';

export interface BizCtxInfo
  extends Omit<BizCtx, 'connectorID' | 'connectorUID' | 'ext'> {
  ext?: { mockSubjectInfo?: string } & Record<string, string>;
}

export type BindSubjectInfo = ComponentSubject & { detail?: BindSubjectDetail };

export interface BasicMockSetInfo {
  bindSubjectInfo: ComponentSubject;
  bizCtx: BizCtx;
}

export interface BindSubjectDetail {
  name?: string;
}
export interface MockSetSelectProps {
  bindSubjectInfo: BindSubjectInfo;
  bizCtx: BizCtxInfo;
  className?: string;
  style?: CSSProperties;
  readonly?: boolean;
}

export enum MockSetStatus {
  Incompatible = 'Incompatible',
  Normal = 'Normal',
}

export interface MockSelectOptionProps extends OptionProps {
  detail?: MockSet;
}

export interface MockSelectRenderOptionProps extends optionRenderProps {
  detail?: MockSet;
}
