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

import { uniqBy } from 'lodash-es';
import { type PropertyJSON } from '@flowgram-adapter/free-layout-editor';
import { type RefExpression } from '@coze-workflow/base/types';

export interface InputItem {
  name: string;
  input: RefExpression;
}

export const uniqInputs = (inputs?: InputItem[]): InputItem[] =>
  uniqBy(
    (inputs || []).filter(_input => _input && _input?.name),
    _child => _child?.name,
  );

export const uniqProperties = (properties?: PropertyJSON[]): PropertyJSON[] =>
  uniqBy(
    (properties || []).filter(_input => _input && _input?.key),
    _child => _child?.key,
  );
