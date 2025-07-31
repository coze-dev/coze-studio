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

import { type ReactNode } from 'react';

import {
  WORKFLOW_NAME_MAX_LEN,
  WORKFLOW_NAME_REGEX,
} from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { type ProjectResourceActionKey } from '@coze-arch/bot-api/plugin_develop';
import {
  type ResourceType,
  ResourceTypeEnum,
} from '@coze-project-ide/framework';

import {
  BizResourceContextMenuBtnType,
  type BizResourceType,
  BizResourceTypeEnum,
  type Validator,
} from './type';
import { iconFolder, iconFolderOpended, resourceIconMap } from './constants';

export const validateNameBasic: Validator = ({ label }) => {
  // Check if name is empty
  if (!label) {
    return I18n.t('project_resource_sidebar_warning_empty_key');
  }

  if (label.length > WORKFLOW_NAME_MAX_LEN) {
    return I18n.t('project_resource_sidebar_warning_length_exceeds');
  }

  // Detection of naming rules for names
  if (!WORKFLOW_NAME_REGEX.test(label)) {
    return I18n.t('workflow_list_create_modal_name_rule_reg');
  }

  return '';
};

export const validateNameConflict: Validator = ({
  label,
  parentPath,
  id,
  resourceTree,
}) => {
  const currentParentPath: Array<ResourceType['id']> = [];
  const checkSubTree = (subTree: ResourceType) => {
    currentParentPath.push(subTree.id);
    if (currentParentPath.join('/') === parentPath.join('/')) {
      return subTree.children?.some(child => {
        const isSelf = id === child.id && id !== '-1';
        return !isSelf && child.name === label;
      });
    } else {
      for (const child of subTree.children || []) {
        const conflict = checkSubTree(child);
        if (conflict) {
          return true;
        }
      }
    }
    currentParentPath.pop();
  };
  const nameConflict = checkSubTree(resourceTree);
  if (nameConflict) {
    return I18n.t('project_resource_sidebar_warning_label_exists', { label });
  }
  return '';
};

export const getResourceIconByResource = (
  resource: ResourceType,
  isExpand?: boolean,
) => {
  let icon: ReactNode;
  switch (resource.type) {
    case ResourceTypeEnum.Folder:
      icon = isExpand ? iconFolderOpended : iconFolder;
      break;
    default:
      icon = resourceIconMap[resource.type as BizResourceTypeEnum] || '';
      break;
  }
  return icon;
};

export const isResourceActionEnabled = (
  resource: BizResourceType,
  action: ProjectResourceActionKey,
): boolean =>
  resource.actions?.find(item => item.key === action)?.enable || false;

// eslint-disable-next-line complexity
export const getContextMenuLabel = (
  contextMenuType: BizResourceContextMenuBtnType,
  resource?: ResourceType,
): string => {
  let resourceLabelKey: I18nKeysNoOptionsType | '' = '';
  switch (resource?.type) {
    case BizResourceTypeEnum.Workflow:
      resourceLabelKey = 'library_resource_type_workflow';
      break;
    case BizResourceTypeEnum.Plugin:
      resourceLabelKey = 'library_resource_type_plugin';
      break;
    case BizResourceTypeEnum.Knowledge:
      resourceLabelKey = 'library_resource_type_knowledge';
      break;
    case BizResourceTypeEnum.Database:
      resourceLabelKey = 'db_table_entry';
      break;
    default:
      break;
  }
  switch (contextMenuType) {
    case BizResourceContextMenuBtnType.Rename:
      return I18n.t('workflow_detail_node_rename');
    case BizResourceContextMenuBtnType.DuplicateResource:
      return I18n.t('workflow_add_list_copy');
    case BizResourceContextMenuBtnType.Delete:
      return resource?.type === ResourceTypeEnum.Folder
        ? I18n.t('filebox_0042')
        : I18n.t('project_resource_sidebar_delete');
    case BizResourceContextMenuBtnType.CopyToLibrary:
      return I18n.t('project_resource_sidebar_copy_to_library');
    case BizResourceContextMenuBtnType.MoveToLibrary:
      return I18n.t('project_resource_sidebar_move_to_library');
    case BizResourceContextMenuBtnType.EnableKnowledge: {
      return I18n.t('project_resource_sidebar_enable_resource', {
        resource: I18n.t(resourceLabelKey as I18nKeysNoOptionsType),
      });
    }
    case BizResourceContextMenuBtnType.DisableKnowledge:
      return I18n.t('project_resource_sidebar_disable_resource', {
        resource: I18n.t(resourceLabelKey as I18nKeysNoOptionsType),
      });
    case BizResourceContextMenuBtnType.ImportLibraryResource:
      return I18n.t('project_resource_sidebar_import_from_library', {}, '');
    case BizResourceContextMenuBtnType.UpdateDesc:
      return I18n.t('project_241115', {}, '修改描述');
    case BizResourceContextMenuBtnType.SwitchToChatflow:
      return I18n.t('wf_chatflow_121', { flowMode: I18n.t('wf_chatflow_76') });
    case BizResourceContextMenuBtnType.SwitchToWorkflow:
      return I18n.t('wf_chatflow_121', { flowMode: I18n.t('Workflow') });
    default:
      return '';
  }
};

/**
 * Whether the action is dynamically registered
 * @param action
 */
export const isDynamicAction = (action: BizResourceContextMenuBtnType) =>
  ![
    BizResourceContextMenuBtnType.CreateResource,
    BizResourceContextMenuBtnType.CreateFolder,
    BizResourceContextMenuBtnType.Rename,
    BizResourceContextMenuBtnType.Delete,
    BizResourceContextMenuBtnType.DuplicateResource,
  ].includes(action);
