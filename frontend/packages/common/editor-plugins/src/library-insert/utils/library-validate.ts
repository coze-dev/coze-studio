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

import { PlaygroundApi } from '@coze-arch/bot-api';

import {
  type ILibraryItem,
  type ILibraryList,
  type LibraryBlockInfo,
  getReferenceType,
  type LibraryType,
} from '../types';

export const findTargetLibrary = (
  librarys: ILibraryList,
  libraryCheck: LibraryBlockInfo,
): ILibraryItem | undefined => {
  const { type: checkType } = libraryCheck;
  const libraryGroup = librarys.find(
    ({ type, items }) =>
      type === checkType &&
      items.some(item => checkLibraryId(item, libraryCheck)),
  );

  const targetItem = libraryGroup?.items.find(item =>
    checkLibraryId(item, libraryCheck),
  );
  if (!targetItem) {
    return undefined;
  }

  return {
    ...targetItem,
    type: checkType,
  };
};

export const checkLibraryId = (
  library: ILibraryItem,
  libraryCheck: LibraryBlockInfo,
) => {
  const { apiId: checkApiId, id: checkId } = libraryCheck;
  if (checkApiId) {
    return library.api_id === checkApiId;
  }
  return library.id === checkId;
};

export const isLibraryNameOutDate = (
  content: string,
  latestLibrary: ILibraryItem,
): boolean => content !== latestLibrary.name;

export const requestLibraryInfo = async (props: {
  id: string;
  type: LibraryType;
  spaceId?: string;
  apiId?: string;
  projectId?: string;
  avatarBotId?: string;
}): Promise<ILibraryItem | undefined> => {
  const { id, type, apiId, spaceId, projectId, avatarBotId } = props;
  const { data } = await PlaygroundApi.GetPromptReferenceInfo(
    {
      reference_id: id,
      reference_type: getReferenceType(type),
      api_id: apiId,
      space_id: spaceId ?? '',
      project_id: projectId,
      avatar_bot_id: avatarBotId,
    },
    {
      __disableErrorToast: true,
    },
  );
  if (!data) {
    return undefined;
  }
  return {
    ...(data as ILibraryItem),
    type,
  };
};
