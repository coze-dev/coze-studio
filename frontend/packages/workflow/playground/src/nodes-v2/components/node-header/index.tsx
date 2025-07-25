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
 
/**
 * 组件迁移自 packages/workflow/playground/src/form-extensions/setters/node-header
 * 仅做了对新版节点引擎接口适配
 */
import React from 'react';

import { type FieldError } from '@flowgram-adapter/free-layout-editor';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ComponentProps } from '@/nodes-v2/components/types';
import { useGlobalState, useNodeRenderScene } from '@/hooks';
import { NodeHeader as NodeHeaderComponent } from '@/form-extensions/components/node-header';

import { withValidation } from '../validation';

export interface NodeHeaderValue {
  title: string;
  icon: string;
  subTitle: string;
  description: string;
}
export type NodeHeaderProps = ComponentProps<NodeHeaderValue> & {
  errors?: FieldError[];
  readonly?: boolean;
  hideTest?: boolean;
  batchModePath?: string;
  outputsPath?: string;
  extraOperation?: React.ReactNode;
  showTrigger?: boolean;
  triggerIsOpen?: boolean;
  nodeDisabled?: boolean;
  readonlyAllowDeleteOperation?: boolean;
};

export const NodeHeader = withValidation<NodeHeaderProps>(
  ({
    value,
    onChange,
    onBlur,
    readonly = false,
    hideTest = false,
    extraOperation,
    showTrigger = false,
    triggerIsOpen = false,
    nodeDisabled,
    readonlyAllowDeleteOperation,
  }: NodeHeaderProps) => {
    const { title, icon, subTitle, description } = value || {};
    const workflowReadonly = useReadonly();
    const { projectId, projectCommitVersion } = useGlobalState();
    const { isNodeSideSheet } = useNodeRenderScene();

    return (
      <NodeHeaderComponent
        title={title}
        subTitle={subTitle}
        // 如果是coze2.0新版节点渲染 隐藏掉描述
        description={description}
        logo={icon}
        onTitleChange={newTitle => {
          onChange({ ...value, title: newTitle });
          onBlur?.();
        }}
        onDescriptionChange={desc => {
          onChange({ ...value, description: desc });
        }}
        readonly={readonly || workflowReadonly}
        readonlyAllowDeleteOperation={
          workflowReadonly ? false : readonlyAllowDeleteOperation
        }
        hideTest={
          hideTest || IS_BOT_OP || !!(projectId && projectCommitVersion)
        }
        showTrigger={showTrigger}
        triggerIsOpen={triggerIsOpen}
        extraOperation={extraOperation}
        showCloseButton={isNodeSideSheet}
        nodeDisabled={nodeDisabled}
      />
    );
  },
);
