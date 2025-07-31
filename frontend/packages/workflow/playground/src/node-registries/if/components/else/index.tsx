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
