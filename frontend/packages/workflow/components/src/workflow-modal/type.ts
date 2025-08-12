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
 * Product type
 *
 * Due to the problem of the same name of the type, the direct export of ProductInfo points to the type in the background, not the target type. You need to use this method to transfer it.
 */
export type ProductInfo = public_api.ProductInfo;

export enum MineActiveEnum {
  All = '1',
  Mine = '2',
}

/** data source */
export enum DataSourceType {
  /** process */
  Workflow = 'workflow',
  /** @deprecated process store */
  Product = 'product',
}

export type WorkflowItemType =
  | { type: DataSourceType.Workflow; item: WorkflowInfo }
  | { type: DataSourceType.Product; item: ProductInfo };

export const WORKFLOW_LIST_STATUS_ALL = 'all';
/**
 * In the category of workflows within a project when subprocesses are added, the resource library/project workflow category
 */
export enum WorkflowCategory {
  /**
   * project workflow
   */
  Project = 'project',
  /**
   * repository workflow
   */
  Library = 'library',
  /**
   * official example
   */
  Example = 'example',
}
/** Process pop-up status */
export interface WorkflowModalState {
  /** process state */
  status: WorkFlowListStatus | typeof WORKFLOW_LIST_STATUS_ALL;
  /** @Deprecated data type, is the process data or store data being requested? */
  dataSourceType: DataSourceType;
  /** creator */
  creator: MineActiveEnum;
  /** @deprecated workflow template tag */
  workflowTag: number;
  /** @deprecated product label */
  productCategory: string;
  /** Search keywords */
  query: string;
  /** @Deprecated whether to request the current space flow */
  isSpaceWorkflow: boolean;
  /** Selected workflow category */
  workflowCategory?: WorkflowCategory;
  /** Sort by @deprecated store products  */
  sortType?: SortType;
  /** The workflow type for list filtering in the pop-up window, the possible values are All, Workflow, Chatflow. Used for workflow type filtering in the list, at this time Imageflow has been merged into the Workflow type */
  listFlowMode: WorkflowMode;
}

/** process pop-up */
export interface WorkFlowModalModeProps {
  /** The source of the current pop-up window is not uploaded by default. */
  from?: WorkflowModalFrom;
  /** Process type, workflow or image flow, default workflow */
  flowMode?: WorkflowMode;
  /** hidden flow */
  excludedWorkflowIds?: string[];
  /**
   * Filter status Whether the filter component displays all status options, the default is false
   */
  filterOptionShowAll?: boolean;
  /**
   * Whether to hide the sidebar, the default is false. Use the scene details page to select workflow.
   */
  hideSider?: boolean;
  /* Whether to hide the author filter menu */
  hideCreatorSelect?: boolean;
  /**
   * Whether the workflow item shows the delete button, the default is false, used for scene workflow and Douyin doppelganger workflow
   */
  itemShowDelete?: boolean;
  /** @Deprecated Whether to hide the Workflow list module under the space */
  hiddenSpaceList?: boolean;
  /**
   * @deprecated hiddenWorkflowCategories
   * Whether to hide the library module
   */
  hiddenLibrary?: boolean;
  /** Whether to hide the creation workflow entry */
  hiddenCreate?: boolean;
  /**
   * @Deprecated Explore category has been changed to official example, using hiddenWorkflowCategories
   * Hidden Exploration Classification
   */
  hiddenExplore?: boolean;
  /**
   * Hidden workflow classification, the usage is the same as hiddenLibrary, hiddenExplore,
   */
  hiddenWorkflowCategories?: WorkflowCategory[];
  /**
   * Hidden workflow list type filter
   */
  hiddenListFlowModeFilter?: boolean;
  /** Copy button copy, default "copy and add" */
  dupText?: string;
  /** Initial state, configure each filter */
  initState?: Partial<WorkflowModalState>;
  /** list of selected processes */
  workFlowList?: BotPluginWorkFlowItem[];
  /** Selected process list changes */
  onWorkFlowListChange?: (newList: BotPluginWorkFlowItem[]) => void;
  /** selection process */
  onAdd?: (
    item: BotPluginWorkFlowItem,
    config: {
      /** Does it come from copying? */
      isDup: boolean;
      /** Target space */
      spaceId: string;
    },
  ) => void;
  /** removal process */
  onRemove?: (item: BotPluginWorkFlowItem) => void;
  /**
   * Removes the callback hooks after the process, and removeWorkflow removes the association with the bot/scene
   * @param item
   */
  onDelete?: (item: BotPluginWorkFlowItem) => void;
  /**
   * List item click
   *
   * Configuration overrides default behavior: Open a new page Open the details page
   * @Returns returns {handled: true} or undefined does not perform the default action, otherwise the internal default click event is executed
   */
  onItemClick?:
    | ((
        item: WorkflowItemType,
        /** Pop-up status, which can be used to initialize the pop-up */
        modalState: WorkflowModalState,
      ) => { handled: boolean })
    | ((
        item: WorkflowItemType,
        /** Pop-up status, which can be used to initialize the pop-up */
        modalState: WorkflowModalState,
      ) => void);
  /**
   * Successful creation process
   *
   * Configuration can override default behavior: new page opens process details after replication, with parameter from = createSuccess
   */
  onCreateSuccess?: (info: {
    spaceId: string;
    workflowId: string;
    flowMode: WorkflowMode;
  }) => void;
  /**
   * The replication process was successful.
   *
   * Configuration can override default behavior: Toast prompt Copy successful, continue editing
   */
  onDupSuccess?: (item: BotPluginWorkFlowItem) => void;
  /** Callback triggered by introducing a repository file into the project */
  onImport?: (
    item: Pick<BotPluginWorkFlowItem, 'workflow_id' | 'name'>,
  ) => void;
  bindBizId?: string;
  bindBizType?: BindBizType;
  projectId?: string;
  onClose?: () => void;
  /**
   * Create name check in workflow pop-up
   */
  nameValidators?: RuleItem[];
  /** Custom i18n copy */
  i18nMap?: Partial<Record<ModalI18nKey, I18nKey>>;
}

export type WorkflowModalProps = {
  className?: string;
  visible?: boolean;
} & WorkFlowModalModeProps;

export { WorkflowInfo };
