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

import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography, Tooltip, TextArea } from '@coze-arch/coze-design';

import { ValidationErrorWrapper } from '@/form-extensions/components/validation/validation-error-wrapper';

import { type TreeNodeCustomData, type DefaultValueType } from '../../type';
import { DefaultValueInput } from './default-value-input';

import styles from './index.module.less';
interface ExpandContentProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  hasObjectLike?: boolean;
  withDefaultValue?: boolean;
  withDescription?: boolean;
  onDescChange: (desc: string) => void;
  onDefaultValueChange: (defaultValue: DefaultValueType | null) => void;
  defaultValueInputType?: string;
  onDefaultValueInputTypeChange?: (v: string) => void;
  className?: string;
}
export const ExpandContent: FC<ExpandContentProps> = props => {
  const {
    data,
    disabled,
    onDescChange,
    onDefaultValueChange,
    defaultValueInputType,
    onDefaultValueInputTypeChange,
    withDescription = false,
    withDefaultValue = false,
    className,
  } = props;

  const disabledDesc = disabled || data.isPreset;
  const descInput = (
    <TextArea
      className="field-input"
      autosize={{ minRows: 1, maxRows: 5 }}
      disabled={disabledDesc}
      defaultValue={data.description}
      maxLength={disabledDesc ? undefined : 1000}
      onBlur={e => {
        onDescChange(e.target.value);
      }}
      placeholder={I18n.t('wf_chatflow_98')}
    />
  );
  return (
    <div className={classNames('w-full', className)}>
      {withDefaultValue ? (
        <div className="field">
          <div className="mt-2 mb-1">
            <Typography.Text className="coz-fg-secondary text-xs leading-4 font-medium">
              {I18n.t('wf_chatflow_96')}
            </Typography.Text>
          </div>
          <div className={styles['field-content']}>
            <ValidationErrorWrapper
              path={`${data.field?.slice(
                data.field.indexOf('['),
              )}.defaultValue`}
              className={styles.container}
              errorCompClassName={'output-default-value-error-text'}
            >
              {options => (
                <DefaultValueInput
                  className={'field-input'}
                  data={data}
                  disabled={disabled}
                  onBlur={val => {
                    options.onBlur();
                    if (val !== undefined) {
                      onDefaultValueChange?.(val);
                    }
                  }}
                  onChange={val => {
                    options.onChange();
                  }}
                  inputType={defaultValueInputType}
                  onInputTypeChange={onDefaultValueInputTypeChange}
                />
              )}
            </ValidationErrorWrapper>
          </div>
        </div>
      ) : null}
      {withDescription ? (
        <div className="field">
          <div className="mt-2 mb-1">
            <Typography.Text className="coz-fg-secondary text-xs leading-4 font-medium">
              {I18n.t('wf_chatflow_97')}
            </Typography.Text>
          </div>
          <div className={styles['field-content']}>
            {disabledDesc && data.description ? (
              <Tooltip
                wrapperClassName="w-full"
                content={data.description}
                position="top"
              >
                {descInput}
              </Tooltip>
            ) : (
              descInput
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
