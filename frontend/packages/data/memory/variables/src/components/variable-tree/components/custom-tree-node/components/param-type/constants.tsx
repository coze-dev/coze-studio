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

import { type ReactNode } from 'react';

import {
  IconCozNumber,
  IconCozNumberBracket,
  IconCozString,
  IconCozStringBracket,
  IconCozBoolean,
  IconCozBooleanBracket,
  IconCozBrace,
  IconCozBraceBracket,
} from '@coze-arch/coze-design/icons';

import { ViewVariableType } from '@/store';

export const VARIABLE_TYPE_ICONS_MAP: Record<ViewVariableType, ReactNode> = {
  [ViewVariableType.String]: <IconCozString />,
  [ViewVariableType.Integer]: <IconCozNumber />,
  [ViewVariableType.Boolean]: <IconCozBoolean />,
  [ViewVariableType.Number]: <IconCozNumber />,
  [ViewVariableType.Object]: <IconCozBrace />,
  [ViewVariableType.ArrayString]: <IconCozStringBracket />,
  [ViewVariableType.ArrayInteger]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayBoolean]: <IconCozBooleanBracket />,
  [ViewVariableType.ArrayNumber]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayObject]: <IconCozBraceBracket />,
};
