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
