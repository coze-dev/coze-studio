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
  // 是否是草稿态
  draft?: boolean;
  // 错误内容 & 个数
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
   * 是否处于乐观 ui 的保存阶段
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
  isExpand?: boolean /** 只有 resource.type === folder 的时候才会有该字段 */;
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
   * @param label 当前输入框的文本
   * @param parentPath 从 root 开始到 父级的路径
   * @param resourceTree 当前的资源树
   * @returns Promise<string>
   */
  /** */
  customValidator?: (
    data: CustomValidatorPropsType,
  ) => string | Promise<string>;

  /**
   * 默认: absolute;
   * absolute: 不占用树的文档流，错误文案覆盖上去;
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

/** 内置的顶部工具栏的按钮组 */
export enum BuildInToolOperations {
  /** 搜索过滤按钮 */
  CreateFile = 'CreateFile',
  CreateFolder = 'CreateFolder',
  /** 展开收起文件夹 */
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
       * 这里有两类 命令。
       * 1. 不在外部插件中提前注册好的，需要组件内部动态注册的。往往是该组件树定制化的菜单项。比如 校验并运行该资源
       *   那这个 execute 字段是一个必填项
       * 2. 在外部插件中提前注册好的，往往是需要配合快捷键一起使用的，并且具有一定的普适性的命令。比如创建资源，复制资源等。
       *   那这个 execute 不需要配置，的回调在 plugin 中注册的地方触发
       *   上下文可以通过 RESOURCE_FOLDER_CONTEXT_KEY 这个 key 从 ide 上下文中获取
       */
      execute?: () => void;
    }
  | {
      // 分割线
      type: 'separator';
    };

export interface ConfigType {
  /**
   * 每个资源的高度
   */
  itemHeight?: number;
  /**
   * 半个 icon 的宽度，用于左侧折线的计算。
   */
  halfIconWidth?: number;
  /**
   * 每个文件夹下缩进的宽度
   */
  tabSize?: number;

  /**
   * 文件夹下钻最大的深度
   */
  maxDeep?: number;

  /**
   * 资源 name 输入框配置
   */
  input?: {
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
  };

  /**
   * 拖拽过程中的预览框配置项
   */
  dragUi?: {
    disable?: boolean;
    wrapperClassName?: string;

    /**
     * 特别说明： 可以通过配置这里的 top 和 left 来设置相对鼠标的偏移量
     */
    wrapperStyle?: React.CSSProperties;
  };

  resourceUriHandler?: (resource: ResourceType) => URI | null;
}

export interface ResourceFolderContextType {
  id?: string; // folder 组件唯一的 id
  currentSelectedId?: IdType; // 当前选中的资源 id
  tempSelectedMap?: Record<string, ResourceType>; // 当前临时选中的资源 map
  onEnter?: () => void;
  onDelete?: () => void;
  onCreateFolder?: () => void;
  onCreateResource?: (type?: ResourceTypeEnum) => void;
}
