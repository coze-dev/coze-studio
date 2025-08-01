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
 * Return to content
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
