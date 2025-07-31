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

import { type PropsWithChildren } from 'react';

import { type DatabaseSettingField } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Section, useFieldArray, useSectionRef } from '@/form';

import { SelectAndSetFieldsAddButton } from './select-and-set-fields-add-button';

export function SelectAndSetFieldsSection({ children }: PropsWithChildren) {
  const { value } = useFieldArray<DatabaseSettingField>();
  const sectionRef = useSectionRef();

  return (
    <Section
      ref={sectionRef}
      title={I18n.t('workflow_select_and_set_fields_title')}
      isEmpty={!value || value?.length === 0}
      emptyText={I18n.t('workflow_select_and_set_fields_empty')}
      actions={[
        <SelectAndSetFieldsAddButton
          afterAppend={() => sectionRef.current?.open()}
        />,
      ]}
    >
      {children}
    </Section>
  );
}
