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

import { type ComponentProps } from 'react';

import { type Popover } from '@coze-arch/coze-design';

import type { ILibraryList } from '../library-insert';
import type { ExpressionEditorTreeNode } from '../expression/core';

export interface ContentSearchPopoverProps {
  libraries: ILibraryList;
  direction?: ComponentProps<typeof Popover>['position'];
  readonly?: boolean;
  onInsert?: (insertPosition: { from: number; to: number }) => void;
  variableTree?: ExpressionEditorTreeNode[];
}
