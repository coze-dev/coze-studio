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

import type { FC } from 'react';

import { I18n } from '@coze-arch/i18n';

export const DSLPlaceholer: FC = () => (
  <div
    className="flex items-center justify-center rounded-lg coz-bg-plus text-center text-xs font-medium coz-fg-secondary "
    style={{ height: 58 }}
  >
    {I18n.t('shortcut_modal_components')}
  </div>
);
