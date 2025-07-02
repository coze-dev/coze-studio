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
  /** 字符串拼接符号字段名 */
  concatCharFieldName: string;

  /** 字符串拼接结果字段名 */
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
