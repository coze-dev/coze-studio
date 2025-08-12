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

import { ResourceTypeEnum } from './type';
import { BaseResourceContextMenuBtnType } from './hooks/use-right-click-panel/constant';

const ROOT_KEY = '$-ROOT-$';

const RESOURCE_FOLDER_WRAPPER_CLASS = 'resource-list-right-click-wrapper';

const ROOT_NODE = {
  id: ROOT_KEY,
  type: ResourceTypeEnum.Folder,
  name: 'root',
};

const ITEM_HEIGHT = 24;

const HALF_ICON_WIDTH = 5;

const TAB_SIZE = 8;

const MAX_DEEP = 5;

const RESOURCE_FOLDER_CONTEXT_KEY = 'resourceFolderContextKey';

/**
 * Optimistic UI creates the default prefix for the ID of the file
 */
const OPTIMISM_ID_PREFIX = 'resource-folder-optimism-id-';

const MOUSEUP_IGNORE_CLASS_NAME = 'mouseup-ignore-class-name';

const MORE_TOOLS_CLASS_NAME = 'more-tools-class-name';

enum ItemStatus {
  Normal = 'normal',
  Disabled = 'disabled', // Prohibited operation
}

const COLOR_CONFIG = {
  selectedItemBgColor: 'rgba(6, 7, 9, 0.14)',
  tempSelectedItemBgColor: 'rgba(6, 7, 9, 0.04)',
  errorItemBgColor: 'rgba(255, 241, 242, 1)',

  dragFolderHoverBgColor: 'rgba(148, 152, 247, 0.44)',

  textErrorColor: 'rgba(var(--blockwise-error-color))',
  textWarningColor: 'rgba(var(--blockwise-warning-color))',
  textSelectedColor: 'rgba(6, 7, 9, 0.96)',
  textNormalColor: 'rgba(6, 7, 9, 0.5)',
};

export {
  ROOT_KEY,
  ITEM_HEIGHT,
  HALF_ICON_WIDTH,
  TAB_SIZE,
  MAX_DEEP,
  ROOT_NODE,
  ItemStatus,
  COLOR_CONFIG,
  OPTIMISM_ID_PREFIX,
  BaseResourceContextMenuBtnType,
  RESOURCE_FOLDER_WRAPPER_CLASS,
  MOUSEUP_IGNORE_CLASS_NAME,
  RESOURCE_FOLDER_CONTEXT_KEY,
  MORE_TOOLS_CLASS_NAME,
};
