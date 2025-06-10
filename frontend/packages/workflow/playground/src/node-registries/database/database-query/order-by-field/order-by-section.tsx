import { type PropsWithChildren, useRef } from 'react';

import { I18n } from '@coze-arch/i18n';

import { Section, type SectionRefType, useFieldArray } from '@/form';

import { type OrderByFieldSchema } from './types';
import { OrderByAddButton } from './order-by-add-button';

export function OrderBySection({ children }: PropsWithChildren) {
  const sectionRef = useRef<SectionRefType>();
  const { value } = useFieldArray<OrderByFieldSchema>();

  return (
    <Section
      ref={sectionRef}
      title={I18n.t('workflow_order_by_title', {}, '排序字段')}
      actions={[
        <OrderByAddButton
          afterAppend={() => {
            sectionRef.current?.open();
          }}
        />,
      ]}
      isEmpty={!value || value.length === 0}
      emptyText={I18n.t('workflow_order_by_empty', {}, '请添加排序字段')}
    >
      {children}
    </Section>
  );
}
