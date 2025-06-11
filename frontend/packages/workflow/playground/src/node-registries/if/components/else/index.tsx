import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { FormCard } from '@/form-extensions/components/form-card';
import { withField } from '@/form';

export const ElseField = withField(() => (
  <FormCard
    key={'FormCard'}
    collapsible={false}
    portInfo={{ portID: 'false', portType: 'output' }}
    style={{
      border: '1px solid rgba(var(--coze-stroke-6),var(--coze-stroke-6-alpha))',
      background: 'rgba(var(--coze-bg-3),1)',
      borderRadius: 8,
      paddingLeft: 12,
      margin: 0,
    }}
    headerStyle={{
      marginBottom: 0,
    }}
    header={I18n.t('workflow_detail_condition_else')}
  ></FormCard>
));
