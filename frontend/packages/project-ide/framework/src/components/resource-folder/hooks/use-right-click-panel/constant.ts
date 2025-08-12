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

export enum BaseResourceContextMenuBtnType {
  CreateFolder = 'resource-folder-create-folder',
  CreateResource = 'resource-folder-create-resource',
  EditName = 'resource-folder-edit-name',
  Delete = 'resource-folder-delete',
}

export const ContextMenuConfigMap: Record<
  BaseResourceContextMenuBtnType,
  {
    id: string;
    label: string;
    disabled?: boolean;
    executeName: string;
  }
> = {
  [BaseResourceContextMenuBtnType.CreateFolder]: {
    id: BaseResourceContextMenuBtnType.CreateFolder,
    label: 'Create Folder',
    executeName: 'onCreateFolder',
  },
  [BaseResourceContextMenuBtnType.CreateResource]: {
    id: BaseResourceContextMenuBtnType.CreateResource,
    label: 'Create Resource',
    executeName: 'onCreateResource',
  },
  [BaseResourceContextMenuBtnType.EditName]: {
    id: BaseResourceContextMenuBtnType.EditName,
    label: 'Edit Name',
    executeName: 'onEnter',
  },
  [BaseResourceContextMenuBtnType.Delete]: {
    id: BaseResourceContextMenuBtnType.Delete,
    label: 'Delete',
    executeName: 'onDelete',
  },
};
