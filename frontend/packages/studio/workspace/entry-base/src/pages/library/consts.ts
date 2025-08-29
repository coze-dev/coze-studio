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

import { I18n } from '@coze-arch/i18n';
import {
  PublishStatus,
  ResType,
  type LibraryResourceListRequest,
} from '@coze-arch/bot-api/plugin_develop';

export const LIBRARY_PAGE_SIZE = 30;

export type QueryParams = Omit<LibraryResourceListRequest, 'space_id' | 'size'>;

export const initialParam: QueryParams = {
  cursor: '',
  user_filter: 0,
  publish_status_filter: 0,
  res_type_filter: [-1],
  name: '',
};

/** Is it created by the current user?
 * 0 - Do not filter
 * 1 - Current user */
export const getScopeOptions = () => [
  {
    label: I18n.t('library_filter_tags_all_creators'),
    value: 0,
  },
  {
    label: I18n.t('library_filter_tags_created_by_me'),
    value: 1,
  },
];

/** Release status:
 * 0 - Do not filter
 * 1 - Unpublished
 * 2- Published */
export const getStatusOptions = () => [
  {
    label: I18n.t('library_filter_tags_all_status'),
    value: 0,
  },
  {
    label: I18n.t('library_filter_tags_published'),
    value: PublishStatus.Published,
  },
  {
    label: I18n.t('library_filter_tags_unpublished'),
    value: PublishStatus.UnPublished,
  },
];

/** event type */
export const eventLibraryType = {
  [ResType.Plugin]: 'plugin',
  [ResType.Workflow]: 'workflow',
  [ResType.Imageflow]: 'imageflow',
  [ResType.Knowledge]: 'knowledge',
  [ResType.UI]: 'ui',
  [ResType.Prompt]: 'prompt',
  [ResType.Database]: 'database',
  [ResType.Variable]: 'variable',
  [ResType.Voice]: 'voice',
} as const;
