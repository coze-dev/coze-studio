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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { FormInput, useFormApi } from '@coze-arch/coze-design';

import { type Variable } from '@/store';
import { useVariableContext } from '@/context';

import { ReadonlyText } from '../readonly-text';
import {
  requiredRules,
  duplicateRules,
  existKeywordRules,
} from './services/check-rules';
import { useCacheField } from './hooks/use-cache-field';

export const ParamName = (props: {
  data: Variable;
  readonly: boolean;
  onChange: (value: string) => void;
  validateExistKeyword?: boolean;
}) => {
  const { data, onChange, readonly, validateExistKeyword = false } = props;
  const { groups } = useVariableContext();
  const formApi = useFormApi();

  // Use ref to cache the last valid value. When the Tree component is hidden, the component will be destroyed, and the Field field of the Form will be deleted, so it needs to be cached.
  useCacheField(data);

  return (
    <div
      className={cls(
        'w-full overflow-hidden',
        '[&_.semi-form-field-error-message]:absolute',
        '[&_.semi-form-field-error-message]:text-[12px]',
        '[&_.semi-form-field-error-message]:font-[400]',
        '[&_.semi-form-field-error-message]:leading-[16px]',
      )}
    >
      {!readonly ? (
        <>
          <FormInput
            field={`${data.variableId}.name`}
            placeholder={I18n.t('variable_name_placeholder')}
            maxLength={50}
            autoFocus={!data.name}
            noLabel
            rules={[
              {
                validator: (_, value) =>
                  requiredRules.validate({
                    ...data,
                    name: value,
                  }),
                message: requiredRules.message,
              },
              {
                validator: (_, value) =>
                  validateExistKeyword
                    ? existKeywordRules.validate({
                        ...data,
                        name: value,
                      })
                    : true,
                message: existKeywordRules.message,
              },
              {
                validator: (_, value) =>
                  duplicateRules.validate(
                    {
                      ...data,
                      name: value,
                    },
                    groups,
                  ),
                message: duplicateRules.message,
              },
            ]}
            onChange={value => {
              onChange(value);
              formApi.setValue(`${data.variableId}.name`, value);
            }}
            className="w-full truncate"
          />
        </>
      ) : (
        <ReadonlyText value={data.name} />
      )}
    </div>
  );
};
