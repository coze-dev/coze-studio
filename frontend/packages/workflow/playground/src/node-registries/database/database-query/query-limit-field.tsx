import { I18n } from '@coze-arch/i18n';

import { type FieldProps, InputNumberField, Section } from '@/form';

export function QueryLimitField({ name }: Pick<FieldProps, 'name'>) {
  return (
    <Section title={I18n.t('workflow_query_limit_title')}>
      <InputNumberField className="w-full" name={name} defaultValue={100} />
    </Section>
  );
}
