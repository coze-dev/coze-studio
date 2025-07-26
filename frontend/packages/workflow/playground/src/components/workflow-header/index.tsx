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

import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import { IconButton, CozAvatar } from '@coze-arch/coze-design';

import { WorkflowInfo } from '../workflow-header-info';
import { useGlobalState } from '../../hooks';
import { getWorkflowHeaderTestId } from './utils';
import { PublishButton } from './components/publish-button-v2';
import {
  CollaboratorsButton,
  SubmitButton,
  DuplicateButton,
  HistoryButton,
  CreditButton,
  ReferenceButton,
} from './components';

import styles from './index.module.less';

const WorkFlowHeader: React.FC = () => {
  const globalState = useGlobalState();
  const { readonly, info, playgroundProps, workflowId } = globalState;

  return (
    <div className={styles.container}>
      <div
        className={styles.left}
        data-testid={getWorkflowHeaderTestId('info')}
      >
        <IconButton
          icon={<IconCozArrowLeft />}
          color="secondary"
          data-testid={getWorkflowHeaderTestId('back')}
          onClick={() => {
            playgroundProps.onBackClick?.(globalState);
          }}
        />

        <CozAvatar src={info.url || ''} type="platform" alt="Avatar" />

        <WorkflowInfo />
      </div>

      <div className={styles.right}>
        {/* will support soon */}
        {IS_OPEN_SOURCE ? null : <ReferenceButton workflowId={workflowId} />}

        {IS_OPEN_SOURCE ? null : (
          <>
            {!readonly && <CreditButton />}

            <HistoryButton />

            <CollaboratorsButton />

            <SubmitButton />
          </>
        )}

        <PublishButton />

        <DuplicateButton mode={readonly ? 'button' : 'icon'} />
      </div>
    </div>
  );
};

export default React.memo(WorkFlowHeader);
