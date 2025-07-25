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

  // 对于插件来说，初始化表单数据也需要重置 nodeData 数据重新设置
  nodeDataEntity.init();

  // 这里如果插件被删除后，也需要将 nodeMeta 设置上去，便于展示具体的错误信息
  if (!workflow && nodeMeta) {
    nodeDataEntity.setNodeData<StandardNodeType.Api>({
      ...nodeMeta,
    });
    return;
  }

  const isProjectWorkflow = Boolean(
    (workflow as WorkflowDetailInfoData)?.project_id,
  );
  /** 来自资源库的流程需要获取最新的版本号 */
  const latestVersion = isProjectWorkflow
    ? undefined
    : workflow.latest_flow_version;

  const subWorkflowProjectId = isProjectWorkflow
    ? (workflow as WorkflowDetailInfoData)?.project_id
    : undefined;

  /**
   * 从 workflow 数据中提取出 SubWorkflow 节点的一些 NodeData，设置进NodeDataEntity
   */
  nodeDataEntity.setNodeData<StandardNodeType.SubWorkflow>({
    ...nodeMeta,
    ...omit(workflow, ['inputs', 'outputs', 'project_id']),
    // 保留子流程输入定义
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
 * 节点后端数据 -> 前端表单数据
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

  // 同步 apiDetail 数据到 WorkflowNodeData，很多业务逻辑从这里取数据，包括报错界面
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

  // 由于在提交时，会将没有填值的变量给过滤掉，所以需要在初始化时，将默认值补充进来
  // 参见：packages/workflow/nodes/src/workflow-json-format.ts:241
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
      // 如果存在
      return target;
    }

    // 读取参数的默认值，并回填
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
 * 前端表单数据 -> 节点后端数据
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
