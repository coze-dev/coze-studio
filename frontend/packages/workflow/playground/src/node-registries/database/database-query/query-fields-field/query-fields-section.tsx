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

import { type PropsWithChildren, useRef } from 'react';

import { I18n } from '@coze-arch/i18n';

import { Section, type SectionRefType, useFieldArray } from '@/form';

import { type QueryFieldSchema } from './types';
import { QueryFieldsAddButton } from './query-fields-add-button';

export function QueryFieldsSection({ children }: PropsWithChildren) {
  const sectionRef = useRef<SectionRefType>();
  const { value } = useFieldArray<QueryFieldSchema>();

  return (
    <Section
      ref={sectionRef}
      title={I18n.t('workflow_query_fields_title')}
      isEmpty={!value || value.length === 0}
      emptyText={I18n.t('workflow_query_fields_empty')}
      actions={[
        <QueryFieldsAddButton
          afterAppend={() => {
            sectionRef.current?.open();
          }}
        />,
      ]}
    >
      {children}
    </Section>
  );
}
