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
 
import {
  type BindBizType,
  type WorkFlowListStatus,
  type WorkflowMode,
} from '@coze-workflow/base/api';
import { type SortType, type public_api } from '@coze-arch/idl/product_api';
import { type PluginParameter } from '@coze-arch/idl/developer_api';
import { type WorkflowDetailData } from '@coze-arch/bot-api/workflow_api';

import { type RuleItem } from '../workflow-edit';
import { type WorkflowInfo, WorkflowModalFrom } from '../types';
import { type I18nKey, type ModalI18nKey } from './hooks/use-i18n-text';
export { WorkflowModalFrom };

export interface BotPluginWorkFlowItem extends WorkflowDetailData {
  workflow_id: string;
  plugin_id: string;
  name: string;
  desc: string;
  parameters: Array<PluginParameter>;
  plugin_icon: string;
  flow_mode?: WorkflowMode;
  version_name?: string;
}

export type GetProductListRequest = public_api.GetProductListRequest;
/**
 * 商品类型
 *
 * 由于类型同名问题, 直接导出 ProductInfo 指向的是后台的类型不是目标类型,需要使用本方法转一下
 */
export type ProductInfo = public_api.ProductInfo;

export enum MineActiveEnum {
  All = '1',
  Mine = '2',
}

/** 数据来源 */
export enum DataSourceType {
  /** 流程 */
  Workflow = 'workflow',
  /** @deprecated 流程商店 */
  Product = 'product',
}

export type WorkflowItemType =
  | { type: DataSourceType.Workflow; item: WorkflowInfo }
  | { type: DataSourceType.Product; item: ProductInfo };

export const WORKFLOW_LIST_STATUS_ALL = 'all';
/**
 * 项目内的工作流添加子流程时的分类中，资源库/项目工作流分类
 */
export enum WorkflowCategory {
  /**
   * 项目工作流
   */
  Project = 'project',
  /**
   * 资源库工作流
   */
  Library = 'library',
  /**
   * 官方示例
   */
  Example = 'example',
}
/** 流程弹窗状态 */
export interface WorkflowModalState {
  /** 流程状态 */
  status: WorkFlowListStatus | typeof WORKFLOW_LIST_STATUS_ALL;
  /** @deprecated 数据类型, 当前请求的是流程数据还是商店数据 */
  dataSourceType: DataSourceType;
  /** 创建者 */
  creator: MineActiveEnum;
  /** @deprecated 工作流模板标签 */
  workflowTag: number;
  /** @deprecated 商品标签 */
  productCategory: string;
  /** 搜索关键字 */
  query: string;
  /** @deprecated 是否请求当前空间流程 */
  isSpaceWorkflow: boolean;
  /** 选中的 workflow 分类 */
  workflowCategory?: WorkflowCategory;
  /** @deprecated 商店产品下的排序方式  */
  sortType?: SortType;
  /** 弹窗内列表筛选的工作流类型，可以的值是 All、Workflow、Chatflow。用于列表里工作流类型筛选，此时 Imageflow 已经合并到 Workflow 类型中了 */
  listFlowMode: WorkflowMode;
}

/** 流程弹窗 */
export interface WorkFlowModalModeProps {
  /** 当前弹窗来源，默认不传 */
  from?: WorkflowModalFrom;
  /** 流程类型, 工作流还是图像流, 默认工作流 */
  flowMode?: WorkflowMode;
  /** 隐藏的流程 */
  excludedWorkflowIds?: string[];
  /**
   * filter 状态筛选组件是否显示全部状态选项，默认为 false
   */
  filterOptionShowAll?: boolean;
  /**
   * 是否隐藏侧边栏，默认 false。用于场景详情页选择 workflow。
   */
  hideSider?: boolean;
  /* 是否隐藏作者筛选菜单 */
  hideCreatorSelect?: boolean;
  /**
   * workflow item 是否显示删除按钮，默认 false，用于场景 workflow 以及抖音分身工作流
   */
  itemShowDelete?: boolean;
  /** @deprecated 是否隐藏空间下 Workflow 列表模块 */
  hiddenSpaceList?: boolean;
  /**
   * @deprecated 使用 hiddenWorkflowCategories
   * 是否隐藏资源库模块
   */
  hiddenLibrary?: boolean;
  /** 是否隐藏创建工作流入口 */
  hiddenCreate?: boolean;
  /**
   * @deprecated 探索分类已改为官方示例，使用 hiddenWorkflowCategories
   * 隐藏探索分类
   */
  hiddenExplore?: boolean;
  /**
   * 隐藏的工作流分类，用法同 hiddenLibrary、hiddenExplore，
   */
  hiddenWorkflowCategories?: WorkflowCategory[];
  /**
   * 隐藏工作流列表类型筛选
   */
  hiddenListFlowModeFilter?: boolean;
  /** 复制按钮文案, 默认「复制并添加」 */
  dupText?: string;
  /** 初始状态, 配置各筛选项 */
  initState?: Partial<WorkflowModalState>;
  /** 已选流程列表 */
  workFlowList?: BotPluginWorkFlowItem[];
  /** 已选流程列表变化 */
  onWorkFlowListChange?: (newList: BotPluginWorkFlowItem[]) => void;
  /** 选择流程 */
  onAdd?: (
    item: BotPluginWorkFlowItem,
    config: {
      /** 是否来源于复制 */
      isDup: boolean;
      /** 目标空间 */
      spaceId: string;
    },
  ) => void;
  /** 移除流程 */
  onRemove?: (item: BotPluginWorkFlowItem) => void;
  /**
   * 删除流程后的回调 hooks，同时会执行 removeWorkflow 移除和 bot/场景 的关联
   * @param item
   */
  onDelete?: (item: BotPluginWorkFlowItem) => void;
  /**
   * 列表项点击
   *
   * 配置可覆盖默认行为: 新开页面打开详情页
   * @returns 返回 { handled: true } 或 undefined 不执行默认操作，否则执行内部默认的点击事件
   */
  onItemClick?:
    | ((
        item: WorkflowItemType,
        /** 弹窗状态, 可用于初始化弹窗 */
        modalState: WorkflowModalState,
      ) => { handled: boolean })
    | ((
        item: WorkflowItemType,
        /** 弹窗状态, 可用于初始化弹窗 */
        modalState: WorkflowModalState,
      ) => void);
  /**
   * 创建流程成功
   *
   * 配置可覆盖默认行为: 新页面打开复制后的流程详情, 带参数 from=createSuccess
   */
  onCreateSuccess?: (info: {
    spaceId: string;
    workflowId: string;
    flowMode: WorkflowMode;
  }) => void;
  /**
   * 复制流程成功
   *
   * 配置可覆盖默认行为: Toast 提示复制成功, 继续编辑
   */
  onDupSuccess?: (item: BotPluginWorkFlowItem) => void;
  /** 项目内引入资源库文件触发的回调 */
  onImport?: (
    item: Pick<BotPluginWorkFlowItem, 'workflow_id' | 'name'>,
  ) => void;
  bindBizId?: string;
  bindBizType?: BindBizType;
  projectId?: string;
  onClose?: () => void;
  /**
   * 创建 workflow 弹窗内命名校验
   */
  nameValidators?: RuleItem[];
  /** 自定义 i18n 文案 */
  i18nMap?: Partial<Record<ModalI18nKey, I18nKey>>;
}

export type WorkflowModalProps = {
  className?: string;
  visible?: boolean;
} & WorkFlowModalModeProps;

export { WorkflowInfo };
