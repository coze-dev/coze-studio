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
