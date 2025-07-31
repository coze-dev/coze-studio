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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { type MutableRefObject } from 'react';

import {
  type TooltipProps,
  type ButtonProps,
  type SemiButton,
} from '@coze-arch/coze-design';
import { type URI } from '@coze-project-ide/client';

import { type BaseResourceContextMenuBtnType } from './hooks/use-right-click-panel/constant';
import { type CREATE_RESOURCE_ID } from './hooks/use-create-edit-resource';

export type IdType = string;

export enum ResourceTypeEnum {
  Folder = 'folder',
}

export type ItemType = ResourceTypeEnum | string;

export interface ResourceStatusType {
  // Is it a draft?
  draft?: boolean;
  // Error content & number
  problem?: {
    status?: 'normal' | 'error' | 'warning';
    number?: number;
  };
}

export interface ResourceType {
  id: IdType;
  type?: ItemType;
  name: string;
  description?: string;
  children?: ResourceType[];
  path?: string[];
  maxDeep?: number;
  [T: string]: any;
}

export type ResourceMapType<
  T = {
    [T: string]: any;
  },
> = Record<IdType, ResourceType & ResourceStatusType & T>;

export interface CustomResourceConfigType extends ResourceStatusType {
  [T: string]: any;
}

export type CustomResourceConfigMapType = Record<
  IdType,
  CustomResourceConfigType
>;

export type RenderMoreSuffixType =
  | boolean
  | {
      className?: string;
      style?: React.CSSProperties;
      extraProps?: ButtonProps & React.RefAttributes<SemiButton>;
      render?: (
        v: {
          onActive: (e: React.MouseEventHandler<HTMLButtonElement>) => void;
          baseBtn: React.ReactElement;
        } & CommonRenderProps,
      ) => React.ReactElement;
      tooltip?: string | TooltipProps;
    };

export interface CommonComponentProps {
  resource: ResourceType;
  path: Array<IdType>;
  style?: React.CSSProperties;
  isTempSelected?: boolean;
  isSelected?: boolean;
  isInEdit?: boolean;
  isDraggingHover?: boolean;
  icon?: React.ReactElement;
  searchConfig?: {
    searchKey?: string;
    highlightStyle?: React.CSSProperties;
  };
  suffixRender?: {
    width: number;
    render: (v: CommonRenderProps) => React.ReactElement | undefined;
  };
  config?: ConfigType;
  renderMoreSuffix?: RenderMoreSuffixType;
  textRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  isDragging: boolean;
  isExpand?: boolean;
  /**
   * Is it in the preservation stage of optimistic UI?
   */
  isOptimismSaving?: boolean;
  useOptimismUI?:
    | boolean
    | {
        loadingRender?: () => React.ReactElement;
      };
  draggingError?: string;
  contextMenuCallback: (e: any, resources?: ResourceType[]) => () => void;
  resourceTreeWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  currentHoverItem: ResourceType | null;
  validateConfig?: ValidatorConfigType;
  errorMsg?: string;
  errorMsgRef?: MutableRefObject<string>;
  editResourceId: IdType | undefined;
  handleChangeName: (v: string) => void;
  handleSave: (v?: string) => void;
}

export interface DragPropType {
  resourceList?: ResourceType[];
  toId?: IdType;
  errorMsg?: string;
}

export interface ChangeNameType {
  id: IdType;
  name: string;
  type?: ItemType;
  path?: IdType[];
  resource?: ResourceType;
}
export interface DragAndDropType {
  isDragging: boolean;
  draggingError?: string;
  isFocus: boolean;
  tempSelectedMapRef: React.MutableRefObject<Record<string, ResourceType>>;
  dataHandler: (resource: ResourceType) => Record<string, IdType>;
  currentHoverItem: ResourceType | null;
  highlightItemMap: ResourceMapType;
}

export interface EditItemType {
  isInEditMode: boolean;
  errorMsg?: string;
  errorMsgRef?: MutableRefObject<string>;
  editResourceId: IdType | undefined;
  createResourceInfo: {
    parentId: IdType;
    type: ItemType;
    index: number;
  } | null;
  handleChangeName: (v: string) => void;
  handleSave: (v?: string) => void;
}

export interface CommonRenderProps {
  resource: ResourceType;
  isSelected?: boolean;
  isTempSelected?: boolean;
  isExpand?: boolean /** This field is only available when resource.type === folder */;
}

export interface ContextType {
  selected?: IdType;
  disabled?: boolean;
  collapsedMapRef: React.MutableRefObject<Record<IdType, boolean> | null>;
  setCollapsed: (id: IdType, v: boolean) => void;
  searchConfig?: {
    searchKey?: string;
    highlightStyle?: React.CSSProperties;
  };
  resourceTreeWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  resourceMap: React.MutableRefObject<ResourceMapType>;
  dragAndDropContext: DragAndDropType;
  createEditResourceContext: EditItemType;
  renderMoreSuffix?:
    | boolean
    | {
        className?: string;
        style?: React.CSSProperties;
        render?: () => React.ReactElement;
      };
  validateConfig?: ValidatorConfigType;
  contextMenuCallback: (e: any, resources?: ResourceType[]) => () => void;
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  suffixRender?: {
    width: number;
    render: (v: CommonRenderProps) => React.ReactElement | undefined;
  };
  textRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  config?: ConfigType;
  optimismSavingMap: Record<IdType, true>;
  useOptimismUI?:
    | boolean
    | {
        loadingRender?: () => React.ReactElement;
      };
}

export interface CustomValidatorPropsType {
  type: 'create' | 'edit';
  label: string;
  parentPath: string[];
  resourceTree: ResourceType;
  id: IdType | typeof CREATE_RESOURCE_ID;
}

export interface ValidatorConfigType {
  /**
   * @param label the text of the current text box
   * @Param parentPath, path from root to parent
   * @Param resourceTree The current resource tree
   * @returns Promise<string>
   */
  /** */
  customValidator?: (
    data: CustomValidatorPropsType,
  ) => string | Promise<string>;

  /**
   * Default: absolute;
   * Absolute: document flow that does not occupy the tree, and error copy is overwritten;
   */
  errorMsgPosition?: 'absolute';
  errorMsgStyle?: React.CSSProperties;
  errorMsgClassName?: string;
  errorMsgRender?: (msg: string, resource: ResourceType) => React.ReactElement;
}

export interface RightOptionsType {
  id: string;
  label: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  disabled?: boolean;
  disabledMsg?: boolean;
}

export interface CreateResourcePropType {
  type: ItemType;
  parentId: IdType;
  path: IdType[];
  name: string;
  schema?: any;
  description?: string;
}

export interface CommandOption {
  id: string;
  label: string;
  disabled?: boolean;
  disabledMsg?: string;
  onClick?: () => void;
}

/** Built-in button group for top toolbar */
export enum BuildInToolOperations {
  /** Search filter button */
  CreateFile = 'CreateFile',
  CreateFolder = 'CreateFolder',
  /** Expand Collapse Folder */
  ExpandFolder = 'ExpandFolder',
}

export type RightPanelConfigType =
  | {
      // command id
      id: BaseResourceContextMenuBtnType | string;
      label?: string;
      shortLabel?: string;
      disabled?: boolean;
      tooltip?: string;

      /**
       * Here are two categories of orders.
       * 1. If it is not registered in advance in the external plug-in, it needs to be dynamically registered inside the component. Often it is a menu item customized by the component tree. For example, check and run the resource
       *   Then this execute field is a required field
       * 2. Registered in advance in external plugins, often need to be used with shortcuts, and have certain universal commands. Such as creating resources, copying resources, etc.
       *   Then this execute does not need to be configured, and the callback is triggered where it is registered in the plugin.
       *   The context can be obtained from the IDE context by RESOURCE_FOLDER_CONTEXT_KEY this key
       */
      execute?: () => void;
    }
  | {
      // dividing line
      type: 'separator';
    };

export interface ConfigType {
  /**
   * The height of each resource
   */
  itemHeight?: number;
  /**
   * The width of half an icon is used for the calculation of the left polyline.
   */
  halfIconWidth?: number;
  /**
   * The width of indentation under each folder
   */
  tabSize?: number;

  /**
   * Folder drill down to maximum depth
   */
  maxDeep?: number;

  /**
   * Resource name text box configuration
   */
  input?: {
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
  };

  /**
   * Preview box configuration items during drag and drop
   */
  dragUi?: {
    disable?: boolean;
    wrapperClassName?: string;

    /**
     * Special note: You can set the offset relative to the mouse by configuring top and left here
     */
    wrapperStyle?: React.CSSProperties;
  };

  resourceUriHandler?: (resource: ResourceType) => URI | null;
}

export interface ResourceFolderContextType {
  id?: string; // Folder component unique id
  currentSelectedId?: IdType; // The currently selected resource ID.
  tempSelectedMap?: Record<string, ResourceType>; // Currently temporarily selected resource map
  onEnter?: () => void;
  onDelete?: () => void;
  onCreateFolder?: () => void;
  onCreateResource?: (type?: ResourceTypeEnum) => void;
}
