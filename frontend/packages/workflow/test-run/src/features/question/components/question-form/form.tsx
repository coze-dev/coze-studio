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

import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { MessageList } from '../message-list';
import { AnswerInput } from '../answer-input';
import { QuestionFormProvider } from '../../context';
import { NodeEventInfo } from '../../../../components';
import { VirtualSync } from './virtual-sync';

import styles from './form.module.less';

interface QuestionFormProps {
  spaceId: string;
  workflowId: string;
  executeId: string;
  questionEvent?: NodeEvent;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questionEvent,
  ...props
}) => {
  const visible = useMemo(() => !!questionEvent, [questionEvent]);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles['question-form']}>
      <div className={styles['form-notice']}>
        <NodeEventInfo event={questionEvent} />
        <span>{I18n.t('workflow_testrun_hangup_answer')}</span>
      </div>

      <QuestionFormProvider {...props}>
        <div className={styles['form-content']}>
          <VirtualSync questionEvent={questionEvent} />
          <MessageList />
          <AnswerInput />
        </div>
      </QuestionFormProvider>
    </div>
  );
};
