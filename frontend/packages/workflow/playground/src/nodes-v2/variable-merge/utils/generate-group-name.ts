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

import { type MergeGroup } from '../types';
import { GROUP_NAME_PREFIX } from '../constants';

/**
 * Generate variable group name
 */
export function generateGroupName(mergeGroups: MergeGroup[] | undefined) {
  const groups: MergeGroup[] = mergeGroups || [];

  const names = groups.map(mergeGroup => mergeGroup.name);

  let index = 1;
  let newTitle;

  while (true) {
    newTitle = `${GROUP_NAME_PREFIX}${index}`;
    if (!names.includes(newTitle)) {
      break;
    }
    index += 1;
  }
  return newTitle;
}
