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

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  type WorkflowSubCanvas,
  type WorkflowNodeRegistry as WorkflowOriginNodeRegistry,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

import {
  type OutputValueVO,
  type InputValueVO,
  type ValueExpression,
} from './vo';
import { type VariableTagProps } from './view-variable-type';
import { type StandardNodeType } from './node-type';

export interface WorkflowNodeVariablesMeta {
  /**
   * Output variable path, default ['outputs']
   */
  outputsPathList?: string[];
  /**
   * Input variable path, default ['input.inputParameters']
   */
  inputsPathList?: string[];
  batchInputListPath?: string;
}

export namespace WorkflowNodeVariablesMeta {
  export const DEFAULT: WorkflowNodeVariablesMeta = {
    outputsPathList: ['outputs'],
    inputsPathList: ['inputs.inputParameters'],
    batchInputListPath: 'inputs.batch.inputLists',
  };
}

export interface NodeMeta<NodeTest = any> {
  isStart?: boolean;
  isNodeEnd?: boolean;
  deleteDisable?: boolean;
  copyDisable?: boolean; // Unable to copy
  nodeDTOType: StandardNodeType;
  nodeMetaPath?: string;
  batchPath?: string;
  outputsPath?: string;
  inputParametersPath?: string;
  renderKey?: string;
  style?: any;
  errorStyle?: any;
  size?: { width: number; height: number }; // Default size at initialization
  defaultPorts?: Array<any>;
  useDynamicPort?: boolean;
  disableSideSheet?: boolean;
  subCanvas?: (node: WorkflowNodeEntity) => WorkflowSubCanvas | undefined;

  /** Whether to show trigger icon */
  showTrigger?: (props: { projectId?: string }) => boolean;
  /** Whether to hide the test */
  hideTest?: boolean;
  /** Get card input variable label */
  getInputVariableTag?: (
    /** variable name */
    variableName: string | undefined,
    /** Input value or variable */
    input: ValueExpression,
    /** additional parameters */
    extra?: {
      /**
       * Variable service, WorkflowVariableService imported from '@code-workflow/variable'
       * The type is not written here to avoid circular references. In addition, it is unreasonable for the base package to refer to the content of the variable package.
       */
      variableService: any;

      /** current node */
      node: WorkflowNodeEntity;
    },
  ) => VariableTagProps;

  /** Whether to support single-node debugging copilot generation form parameters */
  enableCopilotGenerateTestNodeForm?: boolean;
  /**
   * Get llm ids, all nodes that require large model selection must implement this method
   * Because the user may have an account upgrade or the model is removed from the shelves, the list data pulled normally may not have this id.
   * Therefore, to obtain the model list, you need to traverse all nodes to get the used model IDs.
   * @param nodeJSON
   * @returns
   */
  getLLMModelIdsByNodeJSON?: (
    nodeJSON: WorkflowNodeJSON,
  ) => string[] | undefined | string | number | number[];
  /**
   * Node header not editable & hide... button
   */
  headerReadonly?: boolean;
  headerReadonlyAllowDeleteOperation?: boolean;

  /**
   * Node Help Documentation
   */
  helpLink?: string | ((props: { apiName: string }) => string);
  /**
   * Node test related data
   */
  test?: NodeTest;
}

export interface WorkflowNodeRegistry<NodeTestMeta = any>
  extends WorkflowOriginNodeRegistry {
  variablesMeta?: WorkflowNodeVariablesMeta;
  meta: NodeMeta<NodeTestMeta>;

  /**
   * Specialization: Get the value of the input Parameters according to the node, and judge by /inputParameters field by default
   * @param node
   * @returns
   */
  getNodeInputParameters?: (node: FlowNodeEntity) => InputValueVO[] | undefined;

  /**
   * Get additional actions for the More menu to the right of the Stage node, currently used in the Subprocess node and the Plugin node
   * @returns
   */
  getHeaderExtraOperation?: (
    formValues: any,
    node: FlowNodeEntity,
  ) => React.ReactNode;

  /**
   * Specialization: Get the value of Outputs according to the node, and judge by /outputs field by default
   */
  getNodeOutputs?: (node: FlowNodeEntity) => OutputValueVO[] | undefined;

  /**
   * The last conversion before the node commits, this method is executed after'formMeta.transformOnSubmit'
   * @param node data
   * @Param converted node data
   */
  beforeNodeSubmit?: (node: WorkflowNodeJSON) => WorkflowNodeJSON;

  /**
   * - Node Registry initialization, you can get the initialization data here, and then render the form. Note that the node has not been created at this time
   * - Currently works with v2 form engine nodes
   * @Param nodeJSON node initialization data (when clicking Add, or when fetching from the backend)
   * @Param context WorkflowPlaygroundContext, see packages/workflow/playground/src/workflow-playground-context
   * @returns Promise<void>
   */
  onInit?: (nodeJSON: WorkflowNodeJSON, context: any) => Promise<void>;

  /**
   * - Whether there is an error message (taken from the service), if there is an error message, return an error message, otherwise return an empty string or undefined
   * - Currently consumed in node-context-provider, monitor the current node error message, if any, update the FlowNodeErrorData data, thereby triggering the node to render the error state
   * - Currently works with v2 form engine nodes
   * @Param nodeJSON node initialization data (when clicking Add, or when fetching from the backend)
   * @Param context WorkflowPlaygroundContext, see packages/workflow/playground/src/workflow-playground-context
   */
  checkError?: (nodeJSON: WorkflowNodeJSON, context: any) => string | undefined;

  /**
   * - Called when the node is destroyed, used to do some cleaning work, such as clearing the error information of the joint point and recycling resources
   * - Currently works with v2 form engine nodes
   * @param node
   * @param context workflow-playground-context
   * @returns
   */
  onDispose?: (nodeJSON: WorkflowNodeJSON, context: any) => void;
}
