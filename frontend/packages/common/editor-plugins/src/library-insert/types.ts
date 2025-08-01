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
  PromptReferenceType,
  type PromptReferenceInfo,
} from '@coze-arch/idl/playground_api';

export type LibraryType =
  | 'plugin'
  | 'workflow'
  | 'imageflow'
  | 'table'
  | 'text'
  | 'image';

export interface ILibraryItems {
  type: LibraryType;
  items: ILibraryItem[];
}

export type ILibraryList = ILibraryItems[];

export type ILibraryItem = PromptReferenceInfo & {
  type: LibraryType;
  id: string;
  icon_url: string;
  name: string;
  desc: string;
};

export const getReferenceType = (type: LibraryType): PromptReferenceType => {
  switch (type) {
    case 'plugin':
      return PromptReferenceType.Plugin;
    case 'workflow':
      return PromptReferenceType.Workflow;
    case 'imageflow':
      return PromptReferenceType.ImageFlow;
    case 'text':
      return PromptReferenceType.Knowledge;
    case 'image':
      return PromptReferenceType.Knowledge;
    case 'table':
      return PromptReferenceType.Knowledge;
    default:
      return PromptReferenceType.Plugin;
  }
};
export interface LibraryBlockInfo {
  [key: string]: string | undefined;
  icon: string;
  type: LibraryType;
  id: string;
  uuid: string;
  apiId?: string;
}
