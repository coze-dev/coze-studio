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
 
import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { useNodeRenderScene, useGlobalState } from '@/hooks';

import { withValidation } from '../../components/validation';
import { NodeHeader } from '../../components/node-header';

const NodeHeaderWithValidation = withValidation(
  ({
    value,
    onChange,
    options,
    readonly: workflowReadonly,
  }: SetterComponentProps) => {
    const { title, icon, subTitle, description } = value;
    const { projectId, projectCommitVersion } = useGlobalState();
    const {
      readonly = false,
      hideTest = false,
      extraOperation,
      showTrigger,
      triggerIsOpen,
      nodeDisabled = false,
    } = options;

    const { isNodeSideSheet } = useNodeRenderScene();

    return (
      <NodeHeader
        title={title}
        subTitle={subTitle}
        // 如果是coze2.0新版节点渲染 隐藏掉描述
        description={description}
        logo={icon}
        onTitleChange={newTitle => {
          onChange({ ...value, title: newTitle });
        }}
        onDescriptionChange={desc => onChange({ ...value, description: desc })}
        readonly={readonly || workflowReadonly}
        // 【运维平台】是只读的，不需要展示测试按钮，项目的提交历史也是只读，暂时不能试运行
        hideTest={
          hideTest || IS_BOT_OP || !!(projectId && projectCommitVersion)
        }
        extraOperation={extraOperation}
        showCloseButton={isNodeSideSheet}
        showTrigger={showTrigger}
        triggerIsOpen={triggerIsOpen}
        nodeDisabled={nodeDisabled}
      />
    );
  },
);

export const nodeHeaderSetter = {
  key: 'NodeHeader',
  component: NodeHeaderWithValidation,
};
