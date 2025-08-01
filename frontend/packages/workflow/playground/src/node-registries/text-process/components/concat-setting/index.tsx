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

import React from 'react';

import {
  DEFAULT_DELIMITER_OPTIONS,
  SYSTEM_DELIMITER,
} from '@coze-workflow/nodes';
import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { Section, withField, useField, useForm, useWatch } from '@/form';

import tooltipImageUrlZh from '../../assets/concat_example_zh.png';
import tooltipImageUrlEn from '../../assets/concat_example_en.png';
import { SettingButtonField } from './setting-button';

const TOOLTIP_IMAGE_URL = IS_OVERSEA ? tooltipImageUrlEn : tooltipImageUrlZh;
const ExpressionEditorField = withField<
  {
    placeholder: string;
    inputParameters: InputValueVO[];
    onChange: (v: string) => void;
  },
  string
>(props => {
  const { name, value, onChange, errors } = useField<string>();

  return (
    <ExpressionEditor
      {...props}
      name={name}
      value={value as string}
      onChange={v => {
        onChange(v as string);
      }}
      isError={errors && errors?.length > 0}
    />
  );
});

interface Props {
  /** String Splice symbol field name */
  concatCharFieldName: string;

  /** String Splicing result field name */
  concatResultFieldName: string;
}

export const ConcatSetting = ({
  concatCharFieldName,
  concatResultFieldName,
}: Props) => {
  const form = useForm();

  const inputParameters = useWatch({
    name: 'inputParameters',
  });

  return (
    <Section
      title={I18n.t('workflow_stringprocess_node_method_concat')}
      tooltip={<img src={TOOLTIP_IMAGE_URL} alt="alt image" width="740px" />}
      tooltipClassName="toolip-with-white-bg"
      actions={[
        <SettingButtonField
          name={concatCharFieldName}
          defaultValue={{
            value: SYSTEM_DELIMITER.comma,
            options: DEFAULT_DELIMITER_OPTIONS,
          }}
        />,
      ]}
    >
      <ExpressionEditorField
        name={concatResultFieldName}
        defaultValue=""
        placeholder={I18n.t('workflow_stringprocess_concat_tips')}
        inputParameters={inputParameters as InputValueVO[]}
        onChange={(value: string) => {
          form.setFieldValue(concatResultFieldName, value);
        }}
      />
    </Section>
  );
};
