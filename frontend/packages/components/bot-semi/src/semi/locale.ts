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

import ruRUBase from '@douyinfe/semi-ui/lib/es/locale/source/ru_RU';

export { default as zhCN } from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
export { default as enUS } from '@douyinfe/semi-ui/lib/es/locale/source/en_US';

const confirmButtons = { confirm: 'Подтвердить', cancel: 'Отмена' };

/**
 * Semi's ru_RU with its most visible mistakes fixed: lower-case dialog
 * buttons, literal translations in Pagination, Tabs, Table and Upload, and
 * «утро» / «после» used for AM / PM.
 */
export const ruRU: typeof ruRUBase = {
  ...ruRUBase,
  Pagination: { ...ruRUBase.Pagination, jumpTo: 'Перейти к', page: ' стр.' },
  Modal: { ...confirmButtons },
  Popconfirm: { ...confirmButtons },
  DatePicker: { ...ruRUBase.DatePicker, footer: { ...confirmButtons } },
  Tabs: { more: 'Ещё' },
  Table: {
    ...ruRUBase.Table,
    emptyText: 'Нет данных',
    pageText: '${currentStart}–${currentEnd} из ${total}',
  },
  Upload: { ...ruRUBase.Upload, legalTips: 'Отпустите, чтобы начать загрузку' },
  TimePicker: { ...ruRUBase.TimePicker, AM: 'AM', PM: 'PM' },
};
