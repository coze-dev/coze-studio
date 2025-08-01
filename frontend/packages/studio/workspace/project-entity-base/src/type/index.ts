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

import { type UploadValue } from '@coze-common/biz-components';

export type ModifyUploadValueType<T extends { icon_uri?: string }> = Omit<
  T,
  'icon_uri'
> & { icon_uri?: UploadValue };

export type RequireCopyProjectRequest<
  T extends { project_id?: string; to_space_id?: string },
> = Omit<T, 'project_id' | 'to_space_id'> & {
  project_id: string;
  to_space_id: string;
};
