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
