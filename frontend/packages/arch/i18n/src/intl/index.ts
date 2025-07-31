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

export { type IIntlInitOptions, IntlModuleType, IntlModule } from './types';
import Intl, { IntlInstance } from './i18n-impl';

export { default as I18nCore } from './i18n';

const i18n = IntlInstance;
i18n.t = i18n.t.bind(i18n);
const i18nConstructor = Intl;

export default i18n;
export { i18n as I18n, Intl, i18nConstructor as I18nConstructor };
