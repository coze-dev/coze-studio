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
 
import { nanoid } from 'nanoid';
import { keyBy, set, sortBy, cloneDeep } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import {
  ERROR_BODY_NAME,
  IS_SUCCESS_NAME,
  type ApiNodeDetailDTO,
} from '@coze-workflow/nodes';
import {
  BatchMode,
  BlockInput,
  ViewVariableType,
  type InputValueVO,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';

import { type ApiNodeDTODataWhenOnInit } from '../types';

/**
 * 检查插件 outputs 是否有变更
 * @param prevOutputs
 * @param nextOutputs
 * @returns boolean
 */
export function isApiOutputsChanged(
  prevOutputs: ViewVariableTreeNode[] | undefined,
  nextOutputs: ViewVariableTreeNode[] | undefined,
) {
  if (!prevOutputs && !nextOutputs) {
    return false;
  }

  if ((prevOutputs || []).length !== (nextOutputs || []).length) {
    return true;
  }

  const sortedPrevOutputs = sortBy(prevOutputs, 'name');
  const sortedNextOutputs = sortBy(nextOutputs, 'name');

  let isChanged = false;

  for (let i = 0; i < sortedPrevOutputs.length; i++) {
    const prevOutput = sortedPrevOutputs[i];
    const nextOutput = sortedNextOutputs[i];

    if (
      prevOutput.name !== nextOutput.name ||
      prevOutput.type !== nextOutput.type
    ) {
      isChanged = true;
    } else {
      isChanged = isApiOutputsChanged(prevOutput.children, nextOutput.children);
    }

    if (isChanged) {
      break;
    }
  }

  return isChanged;
}

/**
 * 校验插件是否变更，如果存在变更，返回 true, 否则返回 false
 * @param params api基本参数列表
 * @param inputParameters 入参参数列表
 * @param apiNodeDetail 插件最新的值
 * @returns
 */
export function checkPluginUpdated({
  params,
  inputParameters,
  outputs,
  apiNodeDetail,
  isBatchMode,
}: {
  params: BlockInput[];
  inputParameters: InputValueVO[];
  outputs: ViewVariableTreeNode[]; // outputs 参数已经转换成前端变量格式了
  isBatchMode: boolean;
  apiNodeDetail: ApiNodeDetailDTO;
}): boolean {
  const oldApiNameParam = params?.find(
    (item: BlockInput) => item.name === 'apiName',
  );
  const oldApiName = oldApiNameParam
    ? BlockInput.toLiteral(oldApiNameParam)
    : '';
  const isApiNameChanged = oldApiName !== apiNodeDetail.apiName;

  // 实际保存的必填参数名（如果可选参数填写了，也会包括）
  const oldParamNames = (inputParameters || []).map(v => v.name);

  // API 定义的参数名
  const newParamNames = (apiNodeDetail.inputs || [])?.map(v => v.name);

  // 入参检测目前只检测删除参数场景，增量场景暂时不好检测
  const isInputParamsChanged = !oldParamNames.every(paramName =>
    newParamNames.includes(paramName || ''),
  );

  const isOutputsChanged = isApiOutputsChanged(
    // batch 模式下，变量最外层会包裹一个 outputList 的变量
    // 因此，如果是 batch 模式，这里比较需要比较 outputList 的 children
    isBatchMode ? outputs?.[0]?.children : outputs,
    // api 输出参数需要转化成前端变量格式
    (apiNodeDetail.outputs || []).map(variableUtils.dtoMetaToViewMeta),
  );

  return isApiNameChanged || isInputParamsChanged || isOutputsChanged;
}

/**
 * 更新 apiParam 相关参数的值
 * @param apiParams
 * @param paramName
 * @param updateValue
 */
function updateApiParamValue(
  apiParams: BlockInput[],
  paramName: string,
  updateValue: string,
) {
  const apiNameParam = (apiParams || [])?.find(
    (item: BlockInput) => item.name === paramName,
  );

  if (apiNameParam) {
    set(apiNameParam, 'input.value.content', updateValue);
  }
}

/**
 * 同步插件输入参数
 * @param draft 当前表单
 * @param inputs 插件最新的输入参数
 */
function syncInputParameters(
  draft: ApiNodeDTODataWhenOnInit,
  inputs: ApiNodeDetailDTO['inputs'],
) {
  // 更新入参，主要是删除多余的参数
  if (draft?.inputs?.inputParameters) {
    // 获取最新的参数定义
    const paramMap = keyBy(inputs, 'name');

    // 只有在参数定义中存在的，才保留下来
    draft.inputs.inputParameters = draft?.inputs?.inputParameters.filter(
      param => paramMap[param.name || ''],
    );
  }
}

/**
 * 同步插件输出参数
 * @param draft 当前表单
 * @param outputs 插件最新的输出参数
 */
function syncOutputs(
  draft: ApiNodeDTODataWhenOnInit,
  outputs: ApiNodeDetailDTO['outputs'],
) {
  const isBatchMode = Boolean(draft.inputs?.batch?.batchEnable);

  // batch 模式下，变量最外层会包裹一个 outputList 的变量
  // 因此，如果是 batch 模式，这里比较需要比较 outputList 的 children
  const originOutputs = isBatchMode
    ? draft.outputs?.[0]?.children
    : draft.outputs;

  const isOutputChanged = isApiOutputsChanged(
    (originOutputs || []).filter(
      v => ![ERROR_BODY_NAME, IS_SUCCESS_NAME].includes(v.name),
    ),
    outputs?.map(variableUtils.dtoMetaToViewMeta),
  );

  if (isOutputChanged) {
    // 同步出参
    if (outputs) {
      const outputVal = outputs.map(variableUtils.dtoMetaToViewMeta);

      // 批量模式， 重新生成一下 (参考： packages/workflow/variable/src/legacy/workflow-batch-service.ts)
      if (isBatchMode) {
        draft.outputs = [
          {
            key: nanoid(),
            type: ViewVariableType.ArrayObject,
            name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Batch],
            children: outputVal,
          },
        ];
      } else {
        draft.outputs = outputVal;
      }
    } else {
      // 没有出参了，需要删除原来的出参
      draft.outputs = [];
    }
  }
}

/**
 * 如果插件存在更新，那么同步插件最新的值
 * @param value 当前表单
 * @param apiNodeDetail 插件最新的值
 * @returns 更新后的表单
 */
export function syncToLatestValue(
  value: ApiNodeDTODataWhenOnInit,
  apiNodeDetail: ApiNodeDetailDTO,
) {
  const { apiName, updateTime, inputs, outputs } = apiNodeDetail;
  const draft = cloneDeep(value);
  const apiParams = draft?.inputs?.apiParam || [];
  updateApiParamValue(apiParams, 'apiName', apiName);
  updateApiParamValue(apiParams, 'updateTime', updateTime as string);

  syncInputParameters(draft, inputs);
  syncOutputs(draft, outputs);

  return draft;
}
