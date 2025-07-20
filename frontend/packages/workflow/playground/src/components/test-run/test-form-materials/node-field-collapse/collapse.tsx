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
 
/* eslint-disable @coze-arch/no-batch-import-or-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useFormSchema,
  useTestRunFormStore,
  FormBaseGroupCollapse,
  useForm,
} from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';

import * as ModeFormKit from '../../test-form-v3/mode-form-kit';
import { ModeSwitch } from './node-switch';
import { AIGenerateButton } from './ai-generate';

import css from './collapse.module.less';

export const NodeFieldCollapse: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const schema = useFormSchema();
  const form = useForm();
  const getSchema = useTestRunFormStore(store => store.getSchema);
  const handleAiGenerate = (data, cover) => {
    const originSchema = getSchema();
    if (!originSchema) {
      return;
    }
    const mode = schema['x-form-mode'] || 'form';
    let next: any = ModeFormKit.mergeFormValues({
      mode,
      originFormSchema: originSchema,
      prevValues: form.values,
      nextValues: data,
      ai: true,
      cover,
    });
    if (mode === 'json') {
      next = ModeFormKit.toJsonValues(originSchema, next);
    }
    form.values = next;
  };

  return (
    <FormBaseGroupCollapse
      label={I18n.t('wf_test_run_form_input_collapse_label')}
      extra={
        <div className={css.extra}>
          <ModeSwitch />

          {/* The community version does not support AI-generated test-run inputs, for future expansion */}
          {IS_OPEN_SOURCE ? null : (
            <AIGenerateButton
              schema={schema}
              onGenStart={() => {
                schema.uiState.set('disabled', true);
              }}
              onGenerate={handleAiGenerate}
              onGenEnd={() => {
                schema.uiState.set('disabled', false);
              }}
            />
          )}
        </div>
      }
    >
      {children}
    </FormBaseGroupCollapse>
  );
};
