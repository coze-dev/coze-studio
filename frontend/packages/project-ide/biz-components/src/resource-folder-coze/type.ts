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
 * 用于 ResourceType['type'] 里指定资源类型
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
  /* 创建资源 */
  CreateResource = 'resource-folder-create-resource',
  /* 创建文件夹 */
  CreateFolder = 'resource-folder-create-folder',
  /* 重命名 */
  Rename = 'resource-folder-rename',
  /* 删除 */
  Delete = 'resource-folder-delete',

  /* ----------------- 下面的事件会通过 onAction 进行回调 ----------------- */
  /* 创建副本 */
  DuplicateResource = 'resource-folder-duplicate-resource',
  /* 引入资源库文件 */
  ImportLibraryResource = 'resource-folder-import-library-resource',
  /* 移动到资源库 */
  MoveToLibrary = 'resource-folder-move-to-library',
  /* 复制到资源库 */
  CopyToLibrary = 'resource-folder-copy-to-library',
  /* 启用知识库 */
  EnableKnowledge = 'resource-folder-enable-knowledge',
  /* 禁用知识库 */
  DisableKnowledge = 'resource-folder-disable-knowledge',
  /* 切换为 chatflow */
  SwitchToChatflow = 'resource-folder-switch-to-chatflow',
  /* 切换为 workflow */
  SwitchToWorkflow = 'resource-folder-switch-to-workflow',
  /* 修改描述 */
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
  /** 资源类型 */
  groupType: ProjectResourceGroupType;
  /** 后端资源列表数据 */
  resourceTree: BizResourceType[];
  /** 自定义事件回调，点击右键菜单/上下文菜单会触发，由业务方实现自定义事件的资源更新逻辑逻辑 */
  onAction?: (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => void;
  /**
   * 自定义资源创建流程时使用这个 props，需要业务自己展示资源创建表单，然后更新 resource
   * 如果没有自定义逻辑，使用 onCreate
   */
  onCustomCreate?: (
    groupType: ProjectResourceGroupType,
    subType?: ResourceSubType,
  ) => void;
  /**
   * 使用默认创建资源的方式，创建资源后的回调，在这里调用业务的创建资源接口
   * 配置了 onCustomCreate 会使 onCreate 失效
   * 默认创建资源方式：点击新建菜单后，资源列表增加新资源 input 输入框，输入资源名称回车完成创建，触发 onCreate 回调
   * @param createEvent
   * @param subType 如果配置了 createResourceConfig 数组，会有多个创建资源的菜单，通过 subType 区分子类型
   */
  onCreate?: (
    createEvent: CreateResourcePropType,
    subType?: ResourceSubType,
  ) => void;
  /**
   * 是否可以创建资源
   */
  canCreate?: boolean;
  /**
   * 完成初始加载，用于判断显示空状态
   */
  initLoaded?: boolean;
  /**
   * 创建资源的 UI 配置
   * 如果资源有多个子类型，可以配置为数组
   * 触发 onCreateResource 会传第二个参数 subType
   */
  createResourceConfig?: Array<{
    icon: ReactNode;
    label: string;
    subType: number | string;
    tooltip: ReactNode;
  }>;
  /**
   * 主要用于快捷键创建资源的默认类型。
   */
  defaultResourceType?: BizResourceTypeEnum;
  /**
   * 隐藏更多菜单按钮
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
