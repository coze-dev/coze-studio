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
