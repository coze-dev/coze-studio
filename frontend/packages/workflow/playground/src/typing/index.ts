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
 
import { type NavigateOptions } from 'react-router-dom';

import { type UseBoundStore, type StoreApi } from 'zustand';
import { type interfaces } from 'inversify';
import { type FieldRenderProps } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';
import type {
  StandardNodeType,
  GenerationDiversity,
  WorkflowNodeRegistry,
} from '@coze-workflow/base/types';
import {
  type GetWorkFlowProcessData,
  type OperateType,
  type NodeTemplate as ServerNodeTemplate,
} from '@coze-workflow/base/api';
import { type ResponseFormat } from '@coze-workflow/base';
import type { WsMessageProps } from '@coze-project-ide/framework/src/types';
import type {
  User,
  IntelligenceBasicInfo,
  IntelligencePublishInfo,
} from '@coze-arch/idl/intelligence_api';
import {
  type PluginCategory,
  type PluginAPINode,
  type NodePanelSearchType,
} from '@coze-arch/bot-api/workflow_api';
// import {
//   type PluginParameter,
//   type DebugExample,
//   type PluginAPIInfo,
//   DebugExampleStatus,
//   PluginInfo,
//   PluginApi,
// } from '@coze-arch/bot-api/plugin_develop';

import { type TestRunInstanceCallback } from '../hooks/use-test-run';
import {
  WorkflowGlobalStateEntity,
  type WorkflowInfo,
} from '../entities/workflow-global-state-entity';
import { type TestFormDefaultValue } from '../components/test-run/types';

export type PluginApiNodeTemplate = Omit<PluginAPINode, 'node_type'> & {
  type: StandardNodeType.Api;
  nodeJSON: Partial<WorkflowNodeJSON>;
  version?: string;
};

export type PluginCategoryNodeTemplate = Omit<PluginCategory, 'node_type'> & {
  type: StandardNodeType.Api;
  categoryInfo: { categoryId: string; onlyOfficial?: boolean };
};

/**
 * 插件节点信息，包括插件下的工具列表
 */
export interface PluginNodeTemplate {
  plugin_id: string;
  name: string;
  icon_url: string;
  desc: string;
  tools: Array<PluginApiNodeTemplate>;
}

export interface SubWorkflowNodeTemplate {
  type: StandardNodeType.SubWorkflow;
  name?: string;
  desc?: string;
  icon_url?: string;
  plugin_id?: string;
  workflow_id: string;
  version?: string;
  nodeJSON: Partial<WorkflowNodeJSON>;
}

export type NodeTemplate = Omit<ServerNodeTemplate, 'type'> & {
  type: StandardNodeType;
};

export type UnionNodeTemplate =
  | NodeTemplate
  | PluginApiNodeTemplate
  | PluginCategoryNodeTemplate
  | SubWorkflowNodeTemplate;

export interface DragObject {
  nodeType: StandardNodeType;
  nodeJson?: Partial<WorkflowNodeJSON>;
  /**
   * 节点版本信息，只在拖拽添加有版本信息的工作流、插件节点时会有值
   * pluginId 插件即为插件的 id，工作流为工作流发布后关联的插件 id
   * workflowId 是工作流id，插件不传
   * version 版本信息， plugin 是 version_ts 字段；workflow 不传 version，需要在 drop 之后调接口获取
   */
  nodeVersionInfo: {
    workflowId?: string;
    pluginId?: string;
    version?: string;
  };
  /** 打开弹窗时，传给弹窗 open 方法的 props */
  modalProps?: unknown;
}
export type HandleAddNode = (
  item: DragObject,
  coord: { x: number; y: number },
  isDrag?: boolean,
) => void;

export interface AddNodeRef {
  handleAddNode: HandleAddNode;
}

export interface ProjectApi {
  /** 跳转 */
  navigate: (url: string, options?: NavigateOptions) => void;

  ideGlobalStore: UseBoundStore<
    StoreApi<{
      projectInfo?: {
        ownerInfo?: User;
        projectInfo?: IntelligenceBasicInfo;
        publishInfo?: IntelligencePublishInfo;
      };
    }>
  >;
  /** 设置 tab 状态 */
  setWidgetUIState: (status: string) => void;
  /** 发送消息并跳转 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMsgOpenWidget: (target: string, data?: any) => void;
}

export type WorkflowPlaygroundProps = {
  /** 父容器 */
  parentContainer?: interfaces.Container;

  /** 当前画布附加类名，用于自定义样式 */
  className?: string;

  /** 当前画布自定义样式 */
  style?: React.CSSProperties;

  /** 当前画布关联 workflowId */
  workflowId: string;

  /** 流程所属空间 ID, 如不填则为公共空间 ID */
  spaceId?: string;

  /** 流程版本 */
  commitId?: string;

  /** 整个应用的提交历史版本，只在应用中生效 */
  projectCommitVersion?: string;

  /** 日志ID */
  logId?: string;

  /** 执行ID */
  executeId?: string;

  /** 子流程执行ID */
  subExecuteId?: string;

  /** 提交操作类型，接口需要使用 */
  commitOptType?: OperateType;

  /**
   * 打开来源，从流程预览打开，从 bot 打开
   *
   * - explore 流程探索
   * - bot 编辑页
   * - workflowStore 商店
   * - dupSuccess 复制流程模板/流程商品成功
   * - createSuccess 创建成功
   * - communityTrial packages/community/pages/src/flow-trial/page.tsx
   */
  from?:
    | 'explore'
    | 'bot'
    | 'workflowStore'
    | 'dupSuccess'
    | 'createSuccess'
    | 'communityTrial'
    | 'op'
    | 'workflowTemplate';

  /** 只读模式 */
  readonly?: boolean;

  /** 自定义左侧侧边栏 */
  sidebar?: React.ForwardRefExoticComponent<React.RefAttributes<AddNodeRef>>;

  /**
   * 运行结果展开模式，不配置则根据默认规则展开 (图像流全部展开，工作流展开结束节点)
   * - all 全部展开
   * - end 仅展示结束节点
   */
  defaultResultCollapseMode?: 'all' | 'end';

  /** 自定义顶部栏渲染 */
  renderHeader?: (actions: {
    handleTestRun: () => Promise<void>;
  }) => React.ReactNode;

  /** 初始化成功事件 */
  onInit?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** 返回按钮点击 */
  onBackClick?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** 发布成功 */
  onPublish?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** 运行结果展开状态 */
  onTestRunResultVisibleChange?: (visible: boolean) => void;

  /* testRun 表单默认值 */
  testFormDefaultValues?: TestFormDefaultValue[];

  /** 是否禁止单节点试运行 */
  disabledSingleNodeTest?: boolean;

  /** 禁用试运行和调试工具 */
  disableTraceAndTestRun?: boolean;

  /** 当前项目 id，只在项目内的 workflow 有该字段 */
  projectId?: string;

  /**
   * 获取 project 注入的能力，在非 project 环境无此入参
   */
  getProjectApi?: () => ProjectApi;

  /**
   * 刷新项目资源列表，用于创建完项目内资源后调用
   */
  refetchProjectResourceList?: () => Promise<void>;

  /** 禁止请求 testcase */
  disableGetTestCase?: boolean;

  /**
   * 重命名项目资源
   * @param workflowId
   * @returns
   */
  renameProjectResource?: (workflowId: string) => void;

  /** 当前画布注册的节点类型 */
  nodeRegistries?: WorkflowNodeRegistry[];
} & TestRunInstanceCallback;

export interface WorkflowPlaygroundRef {
  /**
   * 执行全流程 TestRun
   * @param input 预设输入
   * @return  是否触发成功
   */
  triggerTestRun: (input?: Record<string, string>) => Promise<boolean>;
  /**
   * 取消试运行
   */
  cancelTestRun: () => void;
  /**
   * 实时获取试运行结果
   */
  getProcess: (obj: { executeId?: string }) => Promise<void>;
  /**
   * 展示运行结果
   * @param executeIdOrResp 指定执行 ID 或者直接传入服务返回执行结果，都不传则获取最新执行结果
   */
  showTestRunResult: (
    executeIdOrResp?: string | GetWorkFlowProcessData,
    subExecuteId?: string,
  ) => void;
  /**
   * 隐藏运行结果
   */
  hideTestRunResult: () => void;
  /**
   * 重置流程到历史版本
   * @param target 版本目标
   */
  resetToHistory: (target: {
    /** 目标版本 ID */
    commitId: string;
    /** 操作类型 */
    optType: OperateType;
  }) => void;
  /**
   * 滚动到某个节点
   * @param {string} nodeId 节点 ID
   */
  scrollToNode: (nodeId: string) => void;
  /**
   * 触发视图自适应
   * IDE 场景画布初始化可能 display none
   * clientWidth 为 0 时自动 fitView 可能失败
   */
  triggerFitView: () => void;
  /**
   * 刷新流程信息
   */
  reload: () => Promise<void>;
  /**
   * 加载全局变量
   */
  loadGlobalVariables: () => Promise<void>;
  /**
   * 监听资源变化
   */
  onResourceChange: (props: WsMessageProps, callback?: () => void) => void;
}

export interface AddNodePanelProps {
  /** 从添加节点按钮打开 */
  fromAddNodeBtn?: boolean;
  /** 是否启用workflow、plugin 弹窗批量添加，默认 false */
  enableModalMultiAdd?: boolean;
  /** 添加节点面板启用拖拽功能 */
  enableDrag?: boolean;
  /** 是否启用滚动关闭 */
  enableScrollClose?: boolean;
  /** 是否启用节点占位 */
  enableNodePlaceholder?: boolean;
  /** panel 组件锚点元素 selector,用于 click outside 时排除该锚点元素 */
  anchorElement?: string;
}

/**
 * 一级分类节点类型
 */
export const enum NodeSearchSectionType {
  Atom = 'atom',
  SubWorkflow = 'sub_workflow',
  Plugin = 'plugin',
}

/**
 * 二级分类节点数据
 */
export interface NodeSearchCategoryData<DataType> {
  /* 分类 id，用于按分类 load more */
  id?: NodePanelSearchType;
  /* 分类名称 */
  categoryName?: string;
  /* 节点列表 */
  nodeList: Array<DataType>;
  /* 可以 load more */
  hasMore?: boolean;
  /** load more 时下一页的游标，hasMore 为 false 时此值为空 */
  cursor?: string;
}

/**
 * 原子节点分类数据
 */
export type NodeCategory = NodeSearchCategoryData<UnionNodeTemplate>;

/**
 * 一级分类数据
 */
export type NodeSearchResultSection =
  | {
      /* 分类名称  */
      name: string;
      /* 分类数据，包含二级分类的信息 */
      data: NodeCategory[];
      /* 分类数据类型，判断不同节点渲染逻辑 */
      dataType: NodeSearchSectionType.Atom;
    }
  | {
      name: string;
      data: Array<NodeSearchCategoryData<SubWorkflowNodeTemplate>>;
      dataType: NodeSearchSectionType.SubWorkflow;
    }
  | {
      name: string;
      data: Array<NodeSearchCategoryData<PluginNodeTemplate>>;
      dataType: NodeSearchSectionType.Plugin;
    };

export type NodeSearchResult = NodeSearchResultSection[];

export { WorkflowInfo, WorkflowGlobalStateEntity };

export interface IModelValue {
  modelName?: string;
  modelType?: number;
  generationDiversity?: GenerationDiversity;
  responseFormat?: ResponseFormat;
  [k: string]: unknown;
}

export type ComponentProps<TValue> = Omit<
  FieldRenderProps<TValue>['field'],
  'key'
>;

export interface NodeMeta {
  title: string;
  icon: string;
  subTitle: string;
  description: string;
  mainColor: string;
}

export interface SettingOnErrorDTO {
  switch: boolean;
  dataOnErr: string;
}

export interface SettingOnErrorVO {
  settingOnErrorIsOpen: boolean;
  settingOnErrorJSON: string;
}
