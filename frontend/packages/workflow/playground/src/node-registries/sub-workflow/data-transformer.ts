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

import { get, omit } from 'lodash-es';
import {
  type FlowNodeEntity,
  type NodeFormContext,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeData,
  getSortedInputParameters,
  nodeUtils,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  ValueExpressionType,
  type WorkflowDetailInfoData,
} from '@coze-workflow/base';

import { type WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeMeta } from '@/typing';

import { getInputDefaultValue, syncToLatestReleaseState } from './utils';
import {
  type SubWorkflowDetailDTO,
  type SubWorkflowNodeDTODataWhenOnInit,
  type SubWorkflowNodeFormData,
  type Identifier,
  type SubWorkflowNodeDTOData,
} from './types';
import { SubWorkflowNodeService } from './services';

const getSubWorkflowService = (context: WorkflowPlaygroundContext) =>
  context.entityManager.getService<SubWorkflowNodeService>(
    SubWorkflowNodeService,
  );

const getSubWorkflowDetail = (
  identifier: Identifier,
  context: WorkflowPlaygroundContext,
) => {
  const subWorkflowService = getSubWorkflowService(context);
  return subWorkflowService.getApiDetail(identifier);
};

const syncToSubWorkflowNodeData = ({
  node,
  context,
  workflow,
  nodeMeta,
}: {
  node: FlowNodeEntity;
  context: WorkflowPlaygroundContext;
  workflow: SubWorkflowDetailDTO;
  nodeMeta: NodeMeta;
  identifier: Identifier;
}) => {
  const { getNodeTemplateInfoByType } = context;
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);

  // For plugins, initializing the form data also requires resetting the nodeData data reset
  nodeDataEntity.init();

  // Here, if the plugin is deleted, you also need to set nodeMeta to display specific error messages.
  if (!workflow && nodeMeta) {
    nodeDataEntity.setNodeData<StandardNodeType.Api>({
      ...nodeMeta,
    });
    return;
  }

  const isProjectWorkflow = Boolean(
    (workflow as WorkflowDetailInfoData)?.project_id,
  );
  /** The process from the repository requires obtaining the latest version number */
  const latestVersion = isProjectWorkflow
    ? undefined
    : workflow.latest_flow_version;

  const subWorkflowProjectId = isProjectWorkflow
    ? (workflow as WorkflowDetailInfoData)?.project_id
    : undefined;

  /**
   * Extract some NodeData of the SubWorkflow node from the workflow data and set it into NodeDataEntity.
   */
  nodeDataEntity.setNodeData<StandardNodeType.SubWorkflow>({
    ...nodeMeta,
    ...omit(workflow, ['inputs', 'outputs', 'project_id']),
    // Preserve subprocess input definition
    inputsDefinition: workflow?.inputs ?? [],
    description: workflow.desc || '',
    projectId: subWorkflowProjectId,
    flow_mode: workflow.flow_mode,
    latestVersion,
    mainColor:
      getNodeTemplateInfoByType(StandardNodeType.SubWorkflow)?.mainColor ?? '',
  });
};

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: SubWorkflowNodeDTODataWhenOnInit,
  context: NodeFormContext,
) => {
  const { node, playgroundContext } = context;
  const identifier = {
    workflowId: value?.inputs?.workflowId ?? '',
    workflowVersion: value?.inputs?.workflowVersion ?? '',
  };

  const subWorkflowDetail = getSubWorkflowDetail(identifier, playgroundContext);

  // Synchronize apiDetail data to WorkflowNodeData, where a lot of business logic fetches data, including the error interface
  syncToSubWorkflowNodeData({
    node,
    context: playgroundContext,
    workflow: subWorkflowDetail,
    nodeMeta: value.nodeMeta,
    identifier,
  });

  if (!subWorkflowDetail) {
    return value as unknown as SubWorkflowNodeFormData;
  }

  syncToLatestReleaseState(value, subWorkflowDetail);

  const inputParameters = value?.inputs?.inputParameters ?? [];

  // Since variables that are not filled in will be filtered out during commit, the default value needs to be added during initialization
  // See also: packages/workflow/nodes/src/workflow-json-format: 241
  const refillInputParamters = getSortedInputParameters(
    subWorkflowDetail.inputs,
  ).map(inputParam => {
    const newValue = {
      name: inputParam.name,
      input: {
        type: ValueExpressionType.REF,
      },
    };

    const target = inputParameters.find(item => item.name === inputParam.name);

    if (target) {
      // If there is
      return target;
    }

    // Read the default value of the parameter and backfill it
    newValue.input = getInputDefaultValue(inputParam);

    return newValue;
  });

  value.inputs = {
    ...value.inputs,
    inputParameters: refillInputParamters,
  };

  value = nodeUtils.dtoToformValue(value, context);

  return value;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (
  value: SubWorkflowNodeFormData,
  context: NodeFormContext,
): SubWorkflowNodeDTOData => {
  const { playgroundContext } = context;

  const identifier = {
    workflowId: value?.inputs?.workflowId ?? '',
    workflowVersion: value?.inputs?.workflowVersion ?? '',
  };

  const workflow = getSubWorkflowDetail(identifier, playgroundContext);

  if (!get(workflow, 'outputs')) {
    value.outputs = [];
  }

  value = nodeUtils.formValueToDto(value, context);
  return value as unknown as SubWorkflowNodeDTOData;
};
