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
