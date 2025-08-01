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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  nodeUtils,
  getSortedInputParameters,
  type ApiNodeDetailDTO,
  WorkflowNodeData,
} from '@coze-workflow/nodes';
import {
  ValueExpressionType,
  StandardNodeType,
  type ValueExpression,
} from '@coze-workflow/base';

import { type WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeMeta } from '@/typing';
import { PluginNodeService } from '@/services';

import { getCustomSetterProps, getCustomVal } from '../common/utils';
import {
  checkPluginUpdated,
  syncToLatestValue,
} from './utils/api-node-checker';
import {
  extractApiNodeData,
  getApiNodeIdentifier,
  computeNodeVersion,
  withErrorBody,
} from './utils';
import type { ApiNodeDTODataWhenOnInit, ApiNodeFormData } from './types';

const getPluginNodeService = (context: WorkflowPlaygroundContext) =>
  context.entityManager.getService<PluginNodeService>(PluginNodeService);

const getApiDetailApiParam = (nodeJson: ApiNodeDTODataWhenOnInit) =>
  nodeJson?.inputs?.apiParam || [];

const getApiDetail = (
  nodeJson: ApiNodeDTODataWhenOnInit,
  context: WorkflowPlaygroundContext,
) => {
  const pluginService = getPluginNodeService(context);
  const identifier = getApiNodeIdentifier(getApiDetailApiParam(nodeJson));
  return pluginService.getApiDetail(identifier);
};

const syncToApiNodeData = ({
  node,
  context,
  apiDetail,
  nodeMeta,
}: {
  node: FlowNodeEntity;
  context: WorkflowPlaygroundContext;
  apiDetail: ApiNodeDetailDTO;
  nodeMeta: NodeMeta;
}) => {
  const { getNodeTemplateInfoByType } = context;
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);

  // For plugins, initializing the form data also requires resetting the nodeData data reset
  nodeDataEntity.init();

  // Here, if the plugin is deleted, you also need to set nodeMeta to display specific error messages.
  if (!apiDetail && nodeMeta) {
    nodeDataEntity.setNodeData<StandardNodeType.Api>({
      ...nodeMeta,
    });
    return;
  }

  /**
   * Extract some NodeData of the API node from apiDetail and set it into NodeDataEntity.
   */
  const apiNodeData = extractApiNodeData(apiDetail);

  nodeDataEntity.setNodeData<StandardNodeType.Api>({
    ...apiNodeData,
    ...computeNodeVersion(apiDetail),

    // This is the default description of the plugin. The newly modified description needs to be obtained from nodeMeta.description.
    description: apiDetail.desc || '',
    title: apiDetail.name || '',
    icon: apiDetail.icon || '',
    mainColor: getNodeTemplateInfoByType(StandardNodeType.Api)?.mainColor ?? '',
    // Here some historical data depends on the projectId, such as use-node-origination.ts
    projectId: apiDetail.projectID,
  });
};

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: ApiNodeDTODataWhenOnInit,
  context: NodeFormContext,
): ApiNodeFormData => {
  const { node, playgroundContext } = context;
  const apiDetail = getApiDetail(value, playgroundContext);

  // Synchronize apiDetail data to WorkflowNodeData, where a lot of business logic fetches data, including the error interface
  syncToApiNodeData({
    node,
    context: playgroundContext,
    apiDetail,
    nodeMeta: value.nodeMeta,
  });

  if (!apiDetail) {
    return value as unknown as ApiNodeFormData;
  }

  // Check if the plugin has been updated (apiName, inputs, outputs)
  const isUpdated = checkPluginUpdated({
    params: value?.inputs?.apiParam ?? [],
    inputParameters: value.inputs.inputParameters ?? [],
    outputs: value.outputs,
    isBatchMode: Boolean(value.inputs?.batch?.batchEnable),
    apiNodeDetail: apiDetail,
  });

  // There is an update, update the inPluginUpdated value, after the practice runs, reset the value of inPluginUpdated
  if (isUpdated) {
    context.playgroundContext.globalState.inPluginUpdated = true;
  }

  // If there is an update, synchronize the latest data (apiName, inputs, outputs)
  let latestValue = isUpdated ? syncToLatestValue(value, apiDetail) : value;

  // In the previous method syncOutputs to synchronize the plug-in output data, if the plug-in output parameters are changed, the errorBody parameter will be ignored
  // Here, add the errorBody again. In fact, it is better to put this logic in syncOutputs.
  latestValue = withErrorBody(value, latestValue);

  const { inputs } = latestValue || {};
  const inputParameters = inputs?.inputParameters || [];

  const { inputs: pluginInputs, outputs: pluginOutputs } = apiDetail;

  // Since variables that are not filled in will be filtered out during commit, the default value needs to be added during initialization
  // See also: packages/workflow/nodes/src/workflow-json-format: 241
  const refillInputParamters = getSortedInputParameters(pluginInputs).map(
    inputParam => {
      const { key, defaultValue } = getCustomSetterProps(inputParam) || {};
      const isCustomSetter = !!key;

      const newValue = {
        name: inputParam.name,
        input: isCustomSetter
          ? defaultValue
          : {
              type: ValueExpressionType.REF,
            },
      };

      const target = inputParameters.find(
        item => item.name === inputParam.name,
      );

      if (target) {
        // Custom component correction custom value
        if (isCustomSetter) {
          // The value of a custom component does not need to be formatted in ValueExpression
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          target.input = getCustomVal(target.input, inputParam) as any;
        }

        return target;
      }
      return newValue;
    },
  );

  const inputParametersMap = refillInputParamters.reduce((acc, cur) => {
    if (cur.name) {
      acc[cur.name] = cur.input;
    }
    return acc;
  }, {});

  const result = {
    nodeMeta: latestValue?.nodeMeta,
    inputs: {
      ...inputs,
      batchMode: inputs?.batch?.batchEnable ? 'batch' : 'single',
      batch: inputs?.batch?.batchEnable
        ? nodeUtils.batchToVO(inputs.batch, context)
        : undefined,

      inputParameters: inputParametersMap,
    },
    outputs:
      latestValue?.outputs ??
      (pluginOutputs ?? []).map(variableUtils.dtoMetaToViewMeta),
  };

  return result;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (
  value: ApiNodeFormData,
  context: NodeFormContext,
): ApiNodeDTODataWhenOnInit => {
  const { node } = context;

  const apiDetail = node
    .getData<WorkflowNodeData>(WorkflowNodeData)
    .getNodeData<StandardNodeType.Api>();

  const isBatch = value?.inputs?.batchMode === 'batch';
  const batchDTO = nodeUtils.batchToDTO(value?.inputs?.batch, context);

  const submitValue = {
    nodeMeta: value?.nodeMeta,
    inputs: {
      ...value?.inputs,

      batchMode: undefined,
      batch:
        isBatch && batchDTO
          ? {
              batchEnable: true,
              ...batchDTO,
            }
          : undefined,

      inputParameters: Object.entries(value?.inputs?.inputParameters || {})
        .map(([key, innerValue]) => {
          const inputDef = apiDetail?.inputs?.find(item => item.name === key);
          const customSetterProps = inputDef
            ? getCustomSetterProps(inputDef)
            : { key: undefined };
          const isCustomSetter = !!customSetterProps?.key;
          const customProps: ValueExpression = {
            type: ValueExpressionType.LITERAL,
            content: `${innerValue}`,
          };
          return {
            name: key,
            input: isCustomSetter ? customProps : innerValue,
          };
        })
        .filter(item => item.name),
    },
    outputs: value?.outputs,
  };
  return submitValue;
};
