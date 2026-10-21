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

import { type en_US } from '@coze-arch/coze-design/locales';

type CDLocale = typeof en_US;

/**
 * Russian texts for coze-design components, which ship only zh_CN and en_US.
 * The coze-design Locale type limits `locale` to 'zh-CN' | 'en-US', and the
 * components never read that field (they only look up the text keys), so it
 * is set to English, the language Russian falls back to.
 */
export const cdRuRU: CDLocale = {
  locale: 'en-US',
  platform_name: 'Coze',
  delete_title: 'Удалить?',
  cancel: 'Отмена',
  confirm: 'Подтвердить',
  delete_desc: 'Это действие нельзя отменить',
  Copy: 'Копировать',
  Edit: 'Изменить',
  Delete: 'Удалить',
  loaded: 'Все данные загружены',
  loading: 'Загрузка…',
};
