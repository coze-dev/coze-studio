import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import {
  BaseDelimiterSelector,
  type DelimiterSelectorValue,
} from '@/form-extensions/setters/delimiter-selector';
import { withField, useField, Section } from '@/form';

import { SPLIT_CHAR_SETTING } from '../constants';

export const DelimiterSelectorField = withField(props => {
  const { value, onChange, readonly, errors } =
    useField<DelimiterSelectorValue>();

  return (
    <Section
      title={I18n.t('workflow_stringprocess_delimiter_title')}
      tooltip={I18n.t('workflow_stringprocess_delimiter_tooltips')}
    >
      <BaseDelimiterSelector
        {...props}
        value={value as DelimiterSelectorValue}
        readonly={!!readonly}
        onChange={onChange}
        options={SPLIT_CHAR_SETTING}
        hasError={errors && errors?.length > 0}
      />
      <FormItemFeedback errors={errors} />
    </Section>
  );
});
