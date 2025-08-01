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

import { type FormDataTypeName } from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType } from '@coze-workflow/base';

export interface OutputType {
  name: string;
  required: boolean;
  // Hack: At present, the backend will echo to ParamTypeAlias type after saving.
  // The front end uses the FormDataTypeName string type.
  type: FormDataTypeName | ViewVariableType;
  key: string;
}
