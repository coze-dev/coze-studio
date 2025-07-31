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

import { useRef, useState } from 'react';

import { IconClose } from '@douyinfe/semi-icons';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type FormState } from '@coze-arch/bot-semi/Form';
import { Button, Space, Form as BotSemiForm } from '@coze-arch/coze-design';

import { useNl2SqlMutation } from './use-nl2sql-mutation';
import { Result } from './result';
import { AutoGenerateButton } from './button';

import styles from './form.module.less';

interface FormProps {
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

interface FormValues {
  text?: string;
  sql?: string;
}

export const Form: React.FC<FormProps> = ({ onSubmit, onCancel }) => {
  const formRef = useRef<BotSemiForm>(null);
  const [formValues = {}, setFormValues] = useState<FormValues | undefined>();
  const { text } = formValues;
  const isAutoGenerateEnabled = !!text;

  const { getNodeSetterId } = useNodeTestId();

  const { sql, isFetching, nl2sql } = useNl2SqlMutation();
  const useEnabled = !!sql;

  const handleFormChange = (formState: FormState<FormValues>) => {
    const values = formState?.values;
    setFormValues({ ...values });
  };

  const handleClickAutoGenerate = () => {
    if (isAutoGenerateEnabled) {
      nl2sql({ text });
    }
  };

  const handleClickUse = () => {
    if (useEnabled) {
      onSubmit(sql);
    }
  };

  return (
    // Prevent trigger node selection
    <div onClick={e => e.stopPropagation()}>
      <header className={styles.header}>
        <span className={styles.title}>{I18n.t('workflow_240218_11')}</span>
        <IconClose
          className={styles.close}
          onClick={onCancel}
          data-testid={getNodeSetterId('popover-close')}
        />
      </header>

      <BotSemiForm<FormValues>
        className={styles.form}
        ref={formRef}
        layout="vertical"
        onChange={handleFormChange}
      >
        <BotSemiForm.TextArea
          field="text"
          label={I18n.t('workflow_240218_15')}
          placeholder={I18n.t('workflow_240218_16')}
          onFocus={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => e.stopPropagation()}
          data-testid={getNodeSetterId('popover-textarea')}
        />
        <BotSemiForm.Slot
          label={
            <div className={styles['text-label']}>
              {I18n.t('workflow_240218_09')}
              <AutoGenerateButton
                disabled={!isAutoGenerateEnabled}
                className={styles['auto-generate-button']}
                onClick={handleClickAutoGenerate}
                data-testid={getNodeSetterId('popover-generate-btn')}
              />
            </div>
          }
        >
          <Result
            isFetching={isFetching}
            value={sql}
            testId={getNodeSetterId('popover-result')}
          />
        </BotSemiForm.Slot>
      </BotSemiForm>

      <footer className={styles.footer}>
        <Space spacing={12}>
          <Button
            color="primary"
            onClick={onCancel}
            data-testid={getNodeSetterId('popover-cancel-btn')}
          >
            {I18n.t('workflow_240218_17')}
          </Button>
          <Button
            color="hgltplus"
            theme="solid"
            type="primary"
            onClick={handleClickUse}
            disabled={!useEnabled}
            data-testid={getNodeSetterId('popover-use-btn')}
          >
            {I18n.t('workflow_240218_18')}
          </Button>
        </Space>
      </footer>
    </div>
  );
};
