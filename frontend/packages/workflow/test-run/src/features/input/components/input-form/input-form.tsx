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

import { I18n } from '@coze-arch/i18n';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { SchemaForm } from '../schema-form';
import { NodeEventInfo } from '../../../../components';
import { useSync } from './use-sync';

import styles from './input-form.module.less';

interface QuestionFormProps {
  spaceId: string;
  workflowId: string;
  executeId: string;
  inputEvent?: NodeEvent;
}

export const InputForm: React.FC<QuestionFormProps> = ({
  spaceId,
  workflowId,
  executeId,
  inputEvent,
}) => {
  useSync(inputEvent);

  if (!inputEvent) {
    return null;
  }

  return (
    <div className={styles['input-form']}>
      <div className={styles['form-notice']}>
        <NodeEventInfo event={inputEvent} />
        <span>{I18n.t('workflow_testrun_hangup_input')}</span>
      </div>
      <div className={styles['form-content']}>
        <SchemaForm
          spaceId={spaceId}
          workflowId={workflowId}
          executeId={executeId}
          inputEvent={inputEvent}
        />
      </div>
    </div>
  );
};
