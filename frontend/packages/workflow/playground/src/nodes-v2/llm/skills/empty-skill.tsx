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
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { EmptyState } from '@coze-arch/coze-design';

export function EmptySkill() {
  return (
    <div className="flex justify-center pt-[13px] pb-[3px]">
      <EmptyState
        icon={<IconCozEmpty />}
        size="default"
        title={I18n.t('wf_chatflow_155')}
      ></EmptyState>
    </div>
  );
}
