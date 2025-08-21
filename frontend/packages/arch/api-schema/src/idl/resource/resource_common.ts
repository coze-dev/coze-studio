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

export enum ResType {
  Plugin = 1,
  Workflow = 2,
  Imageflow = 3,
  Knowledge = 4,
  UI = 5,
  Prompt = 6,
  Database = 7,
  Variable = 8,
  Voice = 9,
}
export enum PublishStatus {
  /** unpublished */
  UnPublished = 1,
  /** Published */
  Published = 2,
}
export enum ActionKey {
  /** copy */
  Copy = 1,
  /** delete */
  Delete = 2,
  /** enable/disable */
  EnableSwitch = 3,
  /** edit */
  Edit = 4,
  /** Switch to funcflow */
  SwitchToFuncflow = 8,
  /** Switch to chatflow */
  SwitchToChatflow = 9,
  /** Cross-space copy */
  CrossSpaceCopy = 10,
}
export enum ProjectResourceActionKey {
  /** rename */
  Rename = 1,
  /** Create a copy/copy to the current project */
  Copy = 2,
  /** Copy to Library */
  CopyToLibrary = 3,
  /** Move to Library */
  MoveToLibrary = 4,
  /** delete */
  Delete = 5,
  /** enable */
  Enable = 6,
  /** disable */
  Disable = 7,
  /** Switch to funcflow */
  SwitchToFuncflow = 8,
  /** Switch to chatflow */
  SwitchToChatflow = 9,
  /** Modify description */
  UpdateDesc = 10,
}
export enum ProjectResourceGroupType {
  Workflow = 1,
  Plugin = 2,
  Data = 3,
}
export enum ResourceCopyScene {
  /** Copy resources within the project, shallow copy */
  CopyProjectResource = 1,
  /** Copy the project resources to the Library, and publish after copying */
  CopyResourceToLibrary = 2,
  /** Move project resources to Library, copy to publish, and delete project resources later */
  MoveResourceToLibrary = 3,
  /** Copy Library Resources to Project */
  CopyResourceFromLibrary = 4,
  /** Copy the project, along with the resources. Copy the current draft. */
  CopyProject = 5,
  /** The project is published to the channel, and the associated resources need to be published (including the store). Publish with the current draft. */
  PublishProject = 6,
  /** Copy the project template. */
  CopyProjectTemplate = 7,
  /** The project is published to a template, and the specified version of the project is published as a temporary template. */
  PublishProjectTemplate = 8,
  /** The template is approved, put on the shelves, and the official template is copied according to the temporary template. */
  LaunchTemplate = 9,
  /** Draft version archive */
  ArchiveProject = 10,
  /** Online version loaded into draft, draft version loaded into draft */
  RollbackProject = 11,
  /** Cross-space copy of a single resource */
  CrossSpaceCopy = 12,
  /** item cross-space copy */
  CrossSpaceCopyProject = 13,
}
/** Library Resource Operations */
export interface ResourceAction {
  /** An operation corresponds to a unique key, and the key is constrained by the resource side */
  key: ActionKey,
  /** ture = can operate this Action, false = grey out */
  enable: boolean,
}
/** front end */
export interface ResourceInfo {
  /** Resource ID */
  res_id?: string,
  /** resource type */
  res_type?: ResType,
  /**
   * Resource subtype, defined by the resource implementer.
   * Plugin：1-Http; 2-App; 6-Local；Knowledge：0-text; 1-table; 2-image；UI：1-Card
  */
  res_sub_type?: number,
  /** resource name */
  name?: string,
  /** resource description */
  desc?: string,
  /** Resource Icon, full url */
  icon?: string,
  /** Resource creator */
  creator_id?: string,
  /** Resource creator */
  creator_avatar?: string,
  /** Resource creator */
  creator_name?: string,
  /** Resource creator */
  user_name?: string,
  /** Resource release status, 1 - unpublished, 2 - published */
  publish_status?: PublishStatus,
  /** Resource status, each type of resource defines itself */
  biz_res_status?: number,
  /** Whether to enable multi-person editing */
  collaboration_enable?: boolean,
  /** Last edited, unix timestamp */
  edit_time?: string,
  /** Resource Ownership Space ID */
  space_id?: string,
  /** Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type */
  biz_extend?: {
    [key: string | number]: string
  },
  /** Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return; */
  actions?: ResourceAction[],
  /** Whether to ban entering the details page */
  detail_disable?: boolean,
  /** [Data delay optimization] Delete identifier, true-deleted-frontend hides the item, false-normal */
  del_flag?: boolean,
}
export interface ProjectResourceAction {
  /** An operation corresponds to a unique key, and the key is constrained by the resource side */
  key: ProjectResourceActionKey,
  /** ture = can operate this Action, false = grey out */
  enable: boolean,
  /** When enable = false, prompt the copywriter. The backend returns the Starling Key, be careful to put it under the same space. */
  hint?: string,
}
/** The implementer provides display information */
export interface ProjectResourceInfo {
  /** Resource ID */
  res_id: string,
  /** resource name */
  name: string,
  /** Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return; */
  actions: ProjectResourceAction[],
  /**
   * Is the user read-only to the resource?
   * 4: bool ReadOnly (go.tag = "json:\"read_only\"", agw.key = "read_only")
   * resource type
  */
  res_type: ResType,
  /** Resource subtype, defined by the resource implementer. Plugin: 1-Http; 2-App; 6-Local; Knowledge: 0-text; 1-table; 2-image; UI: 1-Card */
  res_sub_type?: number,
  /** Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type */
  biz_extend?: {
    [key: string | number]: string
  },
  /** Resource status, each type of resource defines itself. The front end agrees with each resource party. */
  biz_res_status?: number,
  /** The edited version of the current resource */
  version_str?: string,
}
export interface ProjectResourceGroup {
  /** resource grouping */
  group_type: ProjectResourceGroupType,
  resource_list?: ProjectResourceInfo[],
}
export interface ResourceCopyFailedReason {
  res_id: string,
  res_type: ResType,
  res_name: string,
  reason: string,
  /** abandoned */
  publish_version?: number,
  /** The current version of the resource, either nil or empty string, is considered the latest version. Project release or Library release. */
  publish_version_str?: string,
}
export enum TaskStatus {
  Successed = 1,
  Processing = 2,
  Failed = 3,
  Canceled = 4,
}
export interface ResourceCopyTaskDetail {
  task_id: string,
  /** task status */
  status: TaskStatus,
  /** Replicated resource id */
  res_id: string,
  res_type: ResType,
  scene: ResourceCopyScene,
  /** Resource name before copy */
  res_name?: string,
}