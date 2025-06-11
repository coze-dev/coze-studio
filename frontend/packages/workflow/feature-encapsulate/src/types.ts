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
