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

import { type StandardNodeType } from '@coze-workflow/base/types';
import { type WorkflowMode } from '@coze-workflow/base/api';
import { type PluginContext } from '@flowgram-adapter/free-layout-editor';

import { type EncapsulateResult } from './encapsulate';

export interface EncapsulateGlobalState {
  spaceId: string;
  flowMode: WorkflowMode;
  projectId?: string;
  info: {
    name?: string;
  };
}

export interface NodeMeta {
  description: string;
  icon: string;
  subTitle: string;
  title: string;
}

export type GetGlobalStateOption = (
  context: PluginContext,
) => EncapsulateGlobalState;
export type GetNodeTemplateOption = (
  context: PluginContext,
) => (type: StandardNodeType) => NodeMeta | undefined;
export type OnEncapsulateOption = (
  result: EncapsulateResult,
  ctx: PluginContext,
) => Promise<void>;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
