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
      // 如果数据不存在，表示是删除了数据，不需要继续往下走
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
    /** 如果保存处于勾选状态则取消勾选 */
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
