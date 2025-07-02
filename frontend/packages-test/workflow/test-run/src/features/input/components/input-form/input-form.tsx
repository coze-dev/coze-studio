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
