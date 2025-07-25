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

  // 对于插件来说，初始化表单数据也需要重置 nodeData 数据重新设置
  nodeDataEntity.init();

  // 这里如果插件被删除后，也需要将 nodeMeta 设置上去，便于展示具体的错误信息
  if (!apiDetail && nodeMeta) {
    nodeDataEntity.setNodeData<StandardNodeType.Api>({
      ...nodeMeta,
    });
    return;
  }

  /**
   * 从 apiDetail 中提取出 api 节点的一些 NodeData，设置进 NodeDataEntity
   */
  const apiNodeData = extractApiNodeData(apiDetail);

  nodeDataEntity.setNodeData<StandardNodeType.Api>({
    ...apiNodeData,
    ...computeNodeVersion(apiDetail),

    // 这个是插件默认的 description，最新修改的 description 需要从 nodeMeta.description 获取
    description: apiDetail.desc || '',
    title: apiDetail.name || '',
    icon: apiDetail.icon || '',
    mainColor: getNodeTemplateInfoByType(StandardNodeType.Api)?.mainColor ?? '',
    // 这里部分历史数据依赖 projectId，例如 use-node-origin.ts
    projectId: apiDetail.projectID,
  });
};

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (
  value: ApiNodeDTODataWhenOnInit,
  context: NodeFormContext,
): ApiNodeFormData => {
  const { node, playgroundContext } = context;
  const apiDetail = getApiDetail(value, playgroundContext);

  // 同步 apiDetail 数据到 WorkflowNodeData，很多业务逻辑从这里取数据，包括报错界面
  syncToApiNodeData({
    node,
    context: playgroundContext,
    apiDetail,
    nodeMeta: value.nodeMeta,
  });

  if (!apiDetail) {
    return value as unknown as ApiNodeFormData;
  }

  // 检测插件是否有更新（apiName，inputs, outputs）
  const isUpdated = checkPluginUpdated({
    params: value?.inputs?.apiParam ?? [],
    inputParameters: value.inputs.inputParameters ?? [],
    outputs: value.outputs,
    isBatchMode: Boolean(value.inputs?.batch?.batchEnable),
    apiNodeDetail: apiDetail,
  });

  // 存在更新，更新 inPluginUpdated 值，试运行完毕后，重置 inPluginUpdated 的值
  if (isUpdated) {
    context.playgroundContext.globalState.inPluginUpdated = true;
  }

  // 如果有更新，同步最新的数据（apiName, inputs, outputs）
  let latestValue = isUpdated ? syncToLatestValue(value, apiDetail) : value;

  // 之前在同步插件输出数据的方法 syncOutputs 中，如果插件输出参数有变更，会忽略掉 errorBody 参数
  // 这里重新将 errorBody 补充进来，其实更好的做法应该将这个逻辑放到 syncOutputs 中去
  latestValue = withErrorBody(value, latestValue);

  const { inputs } = latestValue || {};
  const inputParameters = inputs?.inputParameters || [];

  const { inputs: pluginInputs, outputs: pluginOutputs } = apiDetail;

  // 由于在提交时，会将没有填值的变量给过滤掉，所以需要在初始化时，将默认值补充进来
  // 参见：packages/workflow/nodes/src/workflow-json-format.ts:241
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
        // 自定义组件修正自定义值
        if (isCustomSetter) {
          // 自定义组件的值不需要采用 ValueExpression 的格式
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
 * 前端表单数据 -> 节点后端数据
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
