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

import { I18n } from '@coze-arch/i18n';

import { TraceSelect } from '../trace-select';

import css from './header.module.less';

export const TraceListPanelHeader: React.FC = () => (
  <div className={css['trace-panel-header']}>
    <div className={css['header-tabs']}>
      <div className={css['trace-title']}>{I18n.t('debug_btn')}</div>
    </div>
    <TraceSelect />
  </div>
);
