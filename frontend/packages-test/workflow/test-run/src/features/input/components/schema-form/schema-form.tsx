import { useCallback, useMemo, useRef } from 'react';

import { type Form } from '@formily/core';
import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';
import { Button } from '@coze-arch/coze-design';

import { translateSchema } from '../../utils';
import { typeSafeJSONParse, stringifyValue } from '../../../../utils';
import { useTestRunService, useFormSubmitting } from '../../../../hooks';
import { FormCore } from '../../../../components/form-engine';

import styles from './schema-form.module.less';

interface SchemaFormProps {
  spaceId: string;
  workflowId: string;
  executeId: string;
  inputEvent: NodeEvent;
}

export const SchemaForm: React.FC<SchemaFormProps> = ({
  spaceId,
  workflowId,
  executeId,
  inputEvent,
}) => {
  const formRef = useRef<Form<any>>(null);

  const submitting = useFormSubmitting(formRef.current);
  const testRunService = useTestRunService();

  const schema = useMemo(() => {
    const data = (typeSafeJSONParse(inputEvent.data) || {}) as any;
    const temp = (typeSafeJSONParse(data.content) || []) as any[];
    return translateSchema(temp);
  }, [inputEvent]);

  const handleSubmit = useCallback(async () => {
    if (!formRef.current) {
      return;
    }
    try {
      const data = await formRef.current.submit();
      const text = JSON.stringify(stringifyValue(data));
      await workflowApi.WorkFlowTestResume({
        workflow_id: workflowId,
        space_id: spaceId,
        data: text,
        event_id: inputEvent.id || '',
        execute_id: executeId,
      });
    } finally {
      testRunService.continueTestRun();
    }
  }, [spaceId, workflowId, executeId, inputEvent, testRunService]);

  return (
    <div className={styles['schema-form']}>
      <div className={styles['form-content']}>
        <FormCore ref={formRef} schema={schema} />
      </div>
      <div className={styles['form-footer']}>
        <Button loading={submitting} onClick={handleSubmit}>
          {I18n.t('devops_publish_multibranch_Save')}
        </Button>
      </div>
    </div>
  );
};
