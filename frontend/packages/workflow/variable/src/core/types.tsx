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
 
import { type BaseVariableField } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableMeta } from '@coze-workflow/base/types';

export enum ExtendASTKind {
  Image = 'Image',
  File = 'File',
  ExtendBaseType = 'ExtendBaseType',
  MergeGroupExpression = 'MergeGroupExpression',
  SyncBackOutputs = 'SyncBackOutputs',
}

export type WorkflowVariableField = BaseVariableField<
  Partial<ViewVariableMeta>
>;

export interface RenameInfo {
  prevKeyPath: string[];
  nextKeyPath: string[];

  // rename 的位置，及对应的 key 值
  modifyIndex: number;
  modifyKey: string;
}

export interface GetKeyPathCtx {
  // 当前所在的节点
  node?: FlowNodeEntity;
  // 验证变量是否在作用域内
  checkScope?: boolean;
}
