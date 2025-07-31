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
 * Plug-in node information, including a list of tools under the plug-in
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
   * Node version information, it will only have value when dragging and dropping to add workflow and plug-in nodes with version information
   * The pluginId plugin is the id of the plugin, and the workflow is the plugin id associated with the workflow after it is published.
   * workflowId is the workflow id, the plugin does not pass it.
   * version version information, plugin is version_ts field; workflow does not pass version, you need to call the interface to get it after drop
   */
  nodeVersionInfo: {
    workflowId?: string;
    pluginId?: string;
    version?: string;
  };
  /** When the pop-up window is opened, the props passed to the pop-up window opening method */
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
  /** jump */
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
  /** Set tab state */
  setWidgetUIState: (status: string) => void;
  /** Send a message and jump */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMsgOpenWidget: (target: string, data?: any) => void;
}

export type WorkflowPlaygroundProps = {
  /** parent container */
  parentContainer?: interfaces.Container;

  /** The current canvas is attached to the class name for custom styles */
  className?: string;

  /** Current canvas custom style */
  style?: React.CSSProperties;

  /** Current canvas associated workflowId */
  workflowId: string;

  /** Process space ID, if not, public space ID */
  spaceId?: string;

  /** Process version */
  commitId?: string;

  /** The commit history version of the entire app, which only takes effect in the app */
  projectCommitVersion?: string;

  /** log ID */
  logId?: string;

  /** Execution ID */
  executeId?: string;

  /** subprocess execution ID */
  subExecuteId?: string;

  /** Submit operation type, the interface needs to be used */
  commitOptType?: OperateType;

  /**
   * Open source, open from process preview, open from bot
   *
   * - explore process exploration
   * - bot edit page
   * - workflowStore
   * - dupSuccess Copy process template/process item success
   * - createSuccess
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

  /** read-only mode */
  readonly?: boolean;

  /** Customize the left sidebar */
  sidebar?: React.ForwardRefExoticComponent<React.RefAttributes<AddNodeRef>>;

  /**
   * Run result expansion mode, if not configured, expand according to the default rules (all image streams are expanded, and the workflow expansion end node)
   * - all unfold
   * - end shows only end nodes
   */
  defaultResultCollapseMode?: 'all' | 'end';

  /** Custom top bar rendering */
  renderHeader?: (actions: {
    handleTestRun: () => Promise<void>;
  }) => React.ReactNode;

  /** Initialization success event */
  onInit?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** Back button click */
  onBackClick?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** Published successfully */
  onPublish?: (workflowState: WorkflowGlobalStateEntity) => void;

  /** run result unfolded state */
  onTestRunResultVisibleChange?: (visible: boolean) => void;

  /* testRun form default */
  testFormDefaultValues?: TestFormDefaultValue[];

  /** Whether to disable single node practice running */
  disabledSingleNodeTest?: boolean;

  /** Disable practice running and debugging tools */
  disableTraceAndTestRun?: boolean;

  /** The current project id, only the workflow within the project has this field */
  projectId?: string;

  /**
   * The ability to obtain project injection, which is not imported in non-project environments
   */
  getProjectApi?: () => ProjectApi;

  /**
   * Refresh the list of project resources for calling after creating resources within the project
   */
  refetchProjectResourceList?: () => Promise<void>;

  /** Disallow request testcase */
  disableGetTestCase?: boolean;

  /**
   * Rename project resources
   * @param workflowId
   * @returns
   */
  renameProjectResource?: (workflowId: string) => void;

  /** The node type currently registered on the canvas */
  nodeRegistries?: WorkflowNodeRegistry[];
} & TestRunInstanceCallback;

export interface WorkflowPlaygroundRef {
  /**
   * Execute the full process TestRun
   * @param input default input
   * Whether @return triggered successfully
   */
  triggerTestRun: (input?: Record<string, string>) => Promise<boolean>;
  /**
   * Cancel practice run
   */
  cancelTestRun: () => void;
  /**
   * Get practice run results in real time
   */
  getProcess: (obj: { executeId?: string }) => Promise<void>;
  /**
   * Show the running results
   * @Param executeIdOrResp Specify the execution ID or directly pass in the service to return the execution result, and get the latest execution result without passing it.
   */
  showTestRunResult: (
    executeIdOrResp?: string | GetWorkFlowProcessData,
    subExecuteId?: string,
  ) => void;
  /**
   * Hide run result
   */
  hideTestRunResult: () => void;
  /**
   * Reset process to historical version
   * @param target version target
   */
  resetToHistory: (target: {
    /** Target Version ID */
    commitId: string;
    /** operation type */
    optType: OperateType;
  }) => void;
  /**
   * Scroll to a node
   * @param {string} nodeId
   */
  scrollToNode: (nodeId: string) => void;
  /**
   * Trigger view adaptation
   * IDE scene canvas initialization may display none
   * Automatic fitView may fail when clientWidth is 0
   */
  triggerFitView: () => void;
  /**
   * Refresh process information
   */
  reload: () => Promise<void>;
  /**
   * Loading global variables
   */
  loadGlobalVariables: () => Promise<void>;
  /**
   * Monitor resource changes
   */
  onResourceChange: (props: WsMessageProps, callback?: () => void) => void;
}

export interface AddNodePanelProps {
  /** Open from the Add Node button */
  fromAddNodeBtn?: boolean;
  /** Whether to enable workflow and plugin pop-up windows to add in batches, the default is false */
  enableModalMultiAdd?: boolean;
  /** Add Node Panel Enable Drag and Drop */
  enableDrag?: boolean;
  /** Whether to enable scrolling shutdown */
  enableScrollClose?: boolean;
  /** Whether to enable node occupancy */
  enableNodePlaceholder?: boolean;
  /** Panel component anchor element selector, used to exclude the anchor element when clicking outside */
  anchorElement?: string;
}

/**
 * first-level classification node type
 */
export const enum NodeSearchSectionType {
  Atom = 'atom',
  SubWorkflow = 'sub_workflow',
  Plugin = 'plugin',
}

/**
 * sub-category node data
 */
export interface NodeSearchCategoryData<DataType> {
  /* Category ID to load more by category */
  id?: NodePanelSearchType;
  /* Category name */
  categoryName?: string;
  /* Node list */
  nodeList: Array<DataType>;
  /* Can load more */
  hasMore?: boolean;
  /** The cursor of the next page when loading more, empty when hasMore is false */
  cursor?: string;
}

/**
 * atomic node classification data
 */
export type NodeCategory = NodeSearchCategoryData<UnionNodeTemplate>;

/**
 * first level classification data
 */
export type NodeSearchResultSection =
  | {
      /* Category name  */
      name: string;
      /* Classified data, including sub-category information */
      data: NodeCategory[];
      /* Classify data types and judge the rendering logic of different nodes */
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
