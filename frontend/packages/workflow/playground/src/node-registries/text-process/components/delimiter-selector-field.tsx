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
