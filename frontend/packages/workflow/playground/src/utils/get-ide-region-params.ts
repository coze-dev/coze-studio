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
import { type EditorProps } from '@coze-workflow/code-editor-adapter';

// The IDE locale is either zh or en. Chinese UI languages get zh, every other
// language (en, ru, ...) gets en. Before i18n is initialised the language is
// unset, which keeps the previous zh default.
const getIDELocale = (): EditorProps['locale'] =>
  (I18n.language ?? 'zh-CN').startsWith('zh') ? 'zh' : 'en';

export const getIDERegionParams = () => ({
  region: IS_BOE
    ? ('boe' as EditorProps['region'])
    : (REGION as EditorProps['region']),
  locale: getIDELocale(),
});
