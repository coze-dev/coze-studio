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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @coze-arch/no-batch-import-or-export */
import {
  FormBaseGroupCollapse,
  useForm,
  useFormSchema,
  useTestRunFormStore,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { TestsetSelect as InnerTestsetSelect } from '@coze-workflow/test-run';
import { I18n } from '@coze-arch/i18n';

import * as ModeFormKit from '../../test-form-v3/mode-form-kit';

import css from './testset-select.module.less';

interface TestsetSelectProps {
  disabled?: boolean;
}

export const TestsetSelect: React.FC<TestsetSelectProps> = ({ disabled }) => {
  const schema = useFormSchema();
  const form = useForm();
  const getSchema = useTestRunFormStore(store => store.getSchema);
  const handleSelectTestset = (data: any) => {
    const originSchema = getSchema();
    if (!data || !originSchema) {
      // If the data does not exist, it means that the data has been deleted and there is no need to proceed further.
      return;
    }
    const mode = schema['x-form-mode'] || 'form';
    let next: any = ModeFormKit.mergeFormValues({
      mode,
      originFormSchema: originSchema,
      prevValues: form.values,
      nextValues: data,
      cover: true,
    });
    /** Uncheck if save is in the ticked state */
    if (next?.[TestFormFieldName.TestsetSave] === true) {
      next[TestFormFieldName.TestsetSave] = false;
    }
    if (mode === 'json') {
      next = ModeFormKit.toJsonValues(originSchema, next);
    }
    form.values = next;
  };

  return (
    <FormBaseGroupCollapse
      label={I18n.t('workflow_testset_available')}
      tooltip={I18n.t('workflow_testset_hover_tips')}
    >
      <InnerTestsetSelect
        className={css['testset-select']}
        disabled={disabled}
        onSelect={handleSelectTestset}
        size="small"
      />
    </FormBaseGroupCollapse>
  );
};
