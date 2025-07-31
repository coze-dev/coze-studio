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

import { type ILibraryList, type LibraryBlockInfo } from '../types';
import { findTargetLibrary, isLibraryNameOutDate } from './library-validate';
interface LibraryBlockTooltipProps {
  librarys: ILibraryList;
  libraryBlockInfo: LibraryBlockInfo | null;
  content: string;
}
export type LibraryStatus = 'disabled' | 'existing' | 'outdated';

export const getLibraryStatus = ({
  librarys,
  libraryBlockInfo,
  content,
}: LibraryBlockTooltipProps): {
  libraryStatus: LibraryStatus;
} => {
  let libraryStatus: LibraryStatus = 'disabled';

  if (!libraryBlockInfo) {
    return {
      libraryStatus: 'disabled',
    };
  }
  const targetLibrary = findTargetLibrary(librarys, libraryBlockInfo);

  if (!targetLibrary) {
    return {
      libraryStatus: 'disabled',
    };
  }

  const isOutdated = isLibraryNameOutDate(content, targetLibrary);

  if (isOutdated) {
    libraryStatus = 'outdated';
  } else {
    libraryStatus = 'existing';
  }

  return {
    libraryStatus,
  };
};
