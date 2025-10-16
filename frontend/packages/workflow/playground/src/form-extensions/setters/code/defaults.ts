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

import {
  DEFAULT_IDE_PYTHON_CODE_PARAMS,
  DEFAULT_OPEN_SOURCE_LANGUAGES,
} from './constants';

function getLanguageTemplates(options?: { isBindDouyin?: boolean }) {
  // open source version only support Python(limit from backend)
  // Now all versions only support Python due to backend limitation
  return DEFAULT_OPEN_SOURCE_LANGUAGES;
}

function getDefaultValue(options?: { isBindDouyin?: boolean }) {
  // Always return Python as default (backend only supports Python)
  return DEFAULT_IDE_PYTHON_CODE_PARAMS;
}

export { getLanguageTemplates, getDefaultValue };
