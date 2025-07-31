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

import { PopoverContent } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';

import s from './index.module.less';

export const KeyTipsNode: React.FC = () => (
  <PopoverContent className={s['modal-key-tip']}>{`- ${I18n.t(
    'db_add_table_field_name_tips1',
  )}
- ${I18n.t('db_add_table_field_name_tips2')}
- ${I18n.t('db_add_table_field_name_tips3')}
- ${I18n.t('db_add_table_field_name_tips4')}`}</PopoverContent>
);
