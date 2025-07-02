import { useMemo, type FC } from 'react';

import { SettingOnErrorProcessType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { JsonEditorAdapter } from '@/components/test-run/test-form-materials/json-editor/new';

import { generateJSONSchema } from '../../utils/generate-json-schema';
import { type ErrorFormProps } from '../../types';
import styles from '../../index.module.less';
import { FormItemFeedback } from '../../../form-item-feedback';

type Props = Pick<
  ErrorFormProps,
  | 'isOpen'
  | 'json'
  | 'onJSONChange'
  | 'readonly'
  | 'defaultValue'
  | 'errorMsg'
  | 'outputs'
> & {
  processType?: SettingOnErrorProcessType;
};

/**
 * 返回内容
 */
export const Json: FC<Props> = ({
  isOpen,
  json,
  onJSONChange,
  readonly,
  defaultValue,
  processType,
  errorMsg,
  outputs,
}) => {
  const jsonSchema = useMemo(() => generateJSONSchema(outputs), [outputs]);

  if (!isOpen || processType !== SettingOnErrorProcessType.RETURN) {
    return null;
  }

  return (
    <>
      <div className="mt-2" data-testid="setting-on-error-json">
        <JsonEditorAdapter
          className={styles['json-editor']}
          value={json ?? ''}
          options={{
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
          }}
          onChange={onJSONChange}
          disabled={readonly}
          height={170}
          defaultValue={defaultValue}
          jsonSchema={jsonSchema}
          title={I18n.t('workflow_250416_08', undefined, '自定义返回内容')}
        />
      </div>
      {errorMsg ? (
        <FormItemFeedback feedbackText={errorMsg}></FormItemFeedback>
      ) : undefined}
    </>
  );
};
