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
  type PicType,
  type GetPicTaskData,
} from '@coze-arch/idl/playground_api';

import { DotStatus } from '../types/generate-image';

function getDotStatus(data: GetPicTaskData, picType: PicType) {
  const { notices = [], tasks = [] } = data || {};
  const task = tasks.find(item => item.type === picType);
  return (task?.status as number) === DotStatus.Generating ||
    notices.some(item => item.type === picType && item.un_read)
    ? task?.status ?? DotStatus.None
    : DotStatus.None;
}

export default getDotStatus;
