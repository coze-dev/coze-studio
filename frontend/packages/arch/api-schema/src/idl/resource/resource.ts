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

import * as resource_common from './resource_common';
export { resource_common };
import * as base from './../base';
export { base };
export interface LibraryResourceListRequest {
  /** Whether created by the current user, 0 - unfiltered, 1 - current user */
  user_filter?: number,
  /** [4,1] 0 means do not filter */
  res_type_filter?: resource_common.ResType[],
  /** name */
  name?: string,
  /** Published status, 0 - unfiltered, 1 - unpublished, 2 - published */
  publish_status_filter?: resource_common.PublishStatus,
  /** User's space ID */
  space_id: string,
  /** The number of data bars read at one time, the default is 10, and the maximum is 100. */
  size?: number,
  /** Cursor, used for paging, default 0, the first request can not be passed, subsequent requests need to bring the last returned cursor */
  cursor?: string,
  /** The field used to specify the custom search, do not fill in the default only name matches, eg [] string {name, custom} matches the name and custom fields full_text */
  search_keys?: string[],
  /** Do you need to return image review when the res_type_filter is [2 workflow] */
  is_get_imageflow?: boolean,
}
export interface LibraryResourceListResponse {
  code: number,
  msg: string,
  resource_list: resource_common.ResourceInfo[],
  /** Cursor, the cursor for the next request */
  cursor?: string,
  /** Is there still data to be pulled? */
  has_more: boolean,
}
export interface ProjectResourceListRequest {
  /** Project ID */
  project_id: string,
  /** User space id */
  space_id: string,
  /** Specify the resources to obtain a version of the project */
  project_version?: string,
}
export interface ProjectResourceListResponse {
  code: number,
  msg: string,
  resource_groups: resource_common.ProjectResourceGroup[],
}
export interface ResourceCopyDispatchRequest {
  /** Scenario, only supports the operation of a single resource */
  scene: resource_common.ResourceCopyScene,
  /** The resource ID selected by the user to copy/move */
  res_id: string,
  res_type: resource_common.ResType,
  /** Project ID */
  project_id?: string,
  res_name?: string,
  /** Target space id for cross-space copy */
  target_space_id?: string,
}
export interface ResourceCopyDispatchResponse {
  code: number,
  msg: string,
  /** Copy task ID, used to query task status or cancel or retry tasks */
  task_id?: string,
  /** The reason why the operation cannot be performed is to return multilingual text */
  failed_reasons?: resource_common.ResourceCopyFailedReason[],
}
export interface ResourceCopyDetailRequest {
  /** Copy task ID, used to query task status or cancel or retry tasks */
  task_id: string
}
export interface ResourceCopyDetailResponse {
  code: number,
  msg: string,
  task_detail?: resource_common.ResourceCopyTaskDetail,
}
export interface ResourceCopyRetryRequest {
  /** Copy task ID, used to query task status or cancel or retry tasks */
  task_id: string
}
export interface ResourceCopyRetryResponse {
  code: number,
  msg: string,
  /** The reason why the operation cannot be performed is to return multilingual text */
  failed_reasons?: resource_common.ResourceCopyFailedReason[],
}
export interface ResourceCopyCancelRequest {
  /** Copy task ID, used to query task status or cancel or retry tasks */
  task_id: string
}
export interface ResourceCopyCancelResponse {
  code: number,
  msg: string,
}