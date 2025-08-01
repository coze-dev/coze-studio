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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozWorkflow,
  IconCozPlugin,
  IconCozDocument,
  IconCozVariables,
} from '@coze-arch/coze-design/icons';
import {
  ProjectResourceActionKey,
  ProjectResourceGroupType,
} from '@coze-arch/bot-api/plugin_develop';
import { ResourceTypeEnum } from '@coze-project-ide/framework';

import { BizResourceContextMenuBtnType, BizResourceTypeEnum } from './type';
export const iconFolder = (
  <i style={{ fontSize: 14 }} className={'codicon codicon-folder'} />
);
export const iconFolderOpended = (
  <i style={{ fontSize: 14 }} className={'codicon codicon-folder-opened'} />
);

export const VARIABLE_RESOURCE_ID = 'variables';

/* Maximum number of characters for a resource file name */
export const RESOURCE_NAME_MAX_LEN = 50;
export const resourceIconMap = {
  [BizResourceTypeEnum.Workflow]: <IconCozWorkflow />,
  [BizResourceTypeEnum.Plugin]: <IconCozPlugin />,
  [BizResourceTypeEnum.Knowledge]: <IconCozDocument />,
  [BizResourceTypeEnum.Variable]: <IconCozVariables />,
};

export const resourceTitleMap = {
  [ProjectResourceGroupType.Workflow]: I18n.t('library_resource_type_workflow'),
  [ProjectResourceGroupType.Plugin]: I18n.t('library_resource_type_plugin'),
  [ProjectResourceGroupType.Data]: I18n.t('dataide001'),
};

export const createResourceLabelMap = {
  [ResourceTypeEnum.Folder]: I18n.t(
    'project_resource_sidebar_create_new_folder',
  ),
  [ProjectResourceGroupType.Workflow]: I18n.t(
    'project_resource_sidebar_create_new_resource',
    { resource: I18n.t('library_resource_type_workflow') },
  ),
  [ProjectResourceGroupType.Plugin]: I18n.t(
    'project_resource_sidebar_create_new_resource',
    { resource: I18n.t('library_resource_type_plugin') },
  ),
  [ProjectResourceGroupType.Data]: I18n.t(
    'project_resource_sidebar_create_new_resource',
    { resource: I18n.t('project_resource_sidebar_data_section') },
  ),
};

export const createResourceIconMap = {
  [ProjectResourceGroupType.Workflow]: <IconCozWorkflow />,
  [ProjectResourceGroupType.Plugin]: <IconCozPlugin />,
  [ProjectResourceGroupType.Data]: <IconCozDocument />,
};

export const contextMenuDTOToVOMap = {
  [ProjectResourceActionKey.Rename]: BizResourceContextMenuBtnType.Rename,
  [ProjectResourceActionKey.Copy]:
    BizResourceContextMenuBtnType.DuplicateResource,
  [ProjectResourceActionKey.Delete]: BizResourceContextMenuBtnType.Delete,
  [ProjectResourceActionKey.CopyToLibrary]:
    BizResourceContextMenuBtnType.CopyToLibrary,
  [ProjectResourceActionKey.MoveToLibrary]:
    BizResourceContextMenuBtnType.MoveToLibrary,
  [ProjectResourceActionKey.Enable]:
    BizResourceContextMenuBtnType.EnableKnowledge,
  [ProjectResourceActionKey.Disable]:
    BizResourceContextMenuBtnType.DisableKnowledge,
  [ProjectResourceActionKey.SwitchToChatflow]:
    BizResourceContextMenuBtnType.SwitchToChatflow,
  [ProjectResourceActionKey.SwitchToFuncflow]:
    BizResourceContextMenuBtnType.SwitchToWorkflow,
  [ProjectResourceActionKey.UpdateDesc]:
    BizResourceContextMenuBtnType.UpdateDesc,
};

export const MAX_DEEP = 6;
export const TAB_SIZE = 14;
export const ITEM_HEIGHT = 28;
/* Disable folder feature */
export const DISABLE_FOLDER = true;
