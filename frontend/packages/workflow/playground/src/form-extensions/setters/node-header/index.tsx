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
        // If it is the new version of coze2.0 node rendering, hide the description.
        description={description}
        logo={icon}
        onTitleChange={newTitle => {
          onChange({ ...value, title: newTitle });
        }}
        onDescriptionChange={desc => onChange({ ...value, description: desc })}
        readonly={readonly || workflowReadonly}
        // [Operation and maintenance platform] is read-only, there is no need to display the test button, and the submission history of the project is also read-only, so practice running cannot be done for the time being.
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
