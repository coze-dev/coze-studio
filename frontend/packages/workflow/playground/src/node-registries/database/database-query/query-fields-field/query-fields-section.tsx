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
