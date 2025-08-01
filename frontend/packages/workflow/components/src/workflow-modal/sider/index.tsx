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

import React, { forwardRef, useContext } from 'react';

import { UICompositionModalSider } from '@coze-arch/bot-semi';

import WorkflowModalContext from '../workflow-modal-context';
import { type WorkFlowModalModeProps } from '../type';
import { useWorkflowSearch } from '../hooks/use-workflow-search';
import { WorkflowFilter, type WorkflowFilterRef } from './workflow-filter';
import { CreateWorkflowBtn } from './create-workflow-btn';

export const WorkflowModalSider = forwardRef<
  WorkflowFilterRef,
  WorkFlowModalModeProps
>((props, ref) => {
  const context = useContext(WorkflowModalContext);
  const { hiddenCreate, hiddenExplore, from } = props;

  const searchNode = useWorkflowSearch();

  if (!context) {
    return null;
  }

  return (
    <UICompositionModalSider style={{ paddingTop: 16 }}>
      <UICompositionModalSider.Header>
        {searchNode}
        {!hiddenCreate && (
          <CreateWorkflowBtn
            className="!mt-6 w-full"
            onCreateSuccess={props.onCreateSuccess}
            nameValidators={props.nameValidators}
            from={from}
          />
        )}
      </UICompositionModalSider.Header>
      <UICompositionModalSider.Content>
        <WorkflowFilter
          ref={ref}
          from={props.from}
          hiddenExplore={hiddenExplore}
          hiddenSpaceList={props.hiddenSpaceList}
          hiddenLibrary={props.hiddenLibrary}
          hiddenWorkflowCategories={props.hiddenWorkflowCategories}
        />
      </UICompositionModalSider.Content>
    </UICompositionModalSider>
  );
});

WorkflowModalSider.displayName = 'WorkflowModalSider';
