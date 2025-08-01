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

import type { ReactNode } from 'react';

import {
  type ProjectResourceGroupType,
  type ProjectResourceInfo,
} from '@coze-arch/bot-api/plugin_develop';
import {
  type CreateResourcePropType,
  type ResourceFolderProps,
  type ResourceType,
  type ResourceTypeEnum,
} from '@coze-project-ide/framework';

/**
 * Used to specify the resource type in ResourceType ['type']
 */
export enum BizResourceTypeEnum {
  Workflow = 'workflow',
  Plugin = 'plugin',
  Knowledge = 'knowledge',
  Database = 'database',
  Variable = 'variables',
}

export interface BizResourceTree {
  groupType?: ProjectResourceGroupType;
  resourceList: BizResourceType[];
}

export enum BizResourceContextMenuBtnType {
  /* Create a resource */
  CreateResource = 'resource-folder-create-resource',
  /* Create Folder */
  CreateFolder = 'resource-folder-create-folder',
  /* rename */
  Rename = 'resource-folder-rename',
  /* delete */
  Delete = 'resource-folder-delete',

  /* ----------------- the following events are called back with onAction ----------------- */
  /* Create a copy */
  DuplicateResource = 'resource-folder-duplicate-resource',
  /* Import repository file */
  ImportLibraryResource = 'resource-folder-import-library-resource',
  /* Move to Library */
  MoveToLibrary = 'resource-folder-move-to-library',
  /* Copy to repository */
  CopyToLibrary = 'resource-folder-copy-to-library',
  /* Enable Knowledge Base */
  EnableKnowledge = 'resource-folder-enable-knowledge',
  /* Disable Knowledge Base */
  DisableKnowledge = 'resource-folder-disable-knowledge',
  /* Switch to chatflow */
  SwitchToChatflow = 'resource-folder-switch-to-chatflow',
  /* Switch to workflow */
  SwitchToWorkflow = 'resource-folder-switch-to-workflow',
  /* Modify description */
  UpdateDesc = 'resource-folder-update-desc',
}

export type BizGroupTypeWithFolder =
  | ProjectResourceGroupType
  | ResourceTypeEnum.Folder;

export type Validator = Required<
  Required<ResourceFolderProps>['validateConfig']
>['customValidator'];

export type BizResourceType = ResourceType & ProjectResourceInfo;

export type ResourceSubType = string | number;

export type ResourceFolderCozeProps = {
  /** resource type */
  groupType: ProjectResourceGroupType;
  /** backend resource list data */
  resourceTree: BizResourceType[];
  /** Custom event callback, click the right-click menu/context menu will trigger, and the business party will implement the resource update logic of the custom event */
  onAction?: (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => void;
  /**
   * This props is used when creating a custom resource definition process. The business needs to display the resource creation form by itself, and then update the resource.
   * If there is no custom logic, use onCreate
   */
  onCustomCreate?: (
    groupType: ProjectResourceGroupType,
    subType?: ResourceSubType,
  ) => void;
  /**
   * Use the default way of creating resources, the callback after creating resources, and call the create resource interface of the business here
   * Configuring onCustomCreate will invalidate onCreate
   * Default resource creation method: After clicking the New menu, add a new resource to the resource list input text box, enter the resource name Enter to complete the creation, and trigger the onCreate callback
   * @param createEvent
   * @Param subType If createResourceConfig array is configured, there will be multiple menus to create resources, distinguish subtypes by subType
   */
  onCreate?: (
    createEvent: CreateResourcePropType,
    subType?: ResourceSubType,
  ) => void;
  /**
   * Is it possible to create resources?
   */
  canCreate?: boolean;
  /**
   * Complete the initial loading, used to determine the display empty state
   */
  initLoaded?: boolean;
  /**
   * Create UI configurations for resources
   * If the resource has multiple subtypes, it can be configured as an array
   * Triggering onCreateResource will pass the second parameter subType
   */
  createResourceConfig?: Array<{
    icon: ReactNode;
    label: string;
    subType: number | string;
    tooltip: ReactNode;
  }>;
  /**
   * Mainly used to shortcut the default type for creating resources.
   */
  defaultResourceType?: BizResourceTypeEnum;
  /**
   * Hide more menu button
   */
  hideMoreBtn?: boolean;
} & Pick<
  ResourceFolderProps,
  | 'id'
  | 'onChangeName'
  | 'onDelete'
  | 'iconRender'
  | 'onContextMenuVisibleChange'
  | 'validateConfig'
>;
