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
 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { get, omit, pick } from 'lodash-es';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import {
  variableUtils,
  type WorkflowVariableService,
} from '@coze-workflow/variable';
import {
  BlockInput,
  type InputValueDTO,
  type NodeDataDTO,
  ValueExpression,
  type ValueExpressionDTO,
} from '@coze-workflow/base';

import { TriggerService } from '@/services';

import {
  CronJobType,
  type DynamicInputsVO,
  type NodeDataVO,
  TriggerForm,
} from './types';

const fixedInputKeys = ['triggerId', 'userId', 'triggerName'];
/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (
  data: NodeDataDTO,
  context: NodeFormContext,
) => {
  // 初始化为 undefined ，就直接 return 。会命中 defaultValue 逻辑
  if (!data) {
    return undefined;
  }

  const triggerService =
    context.node.getService<TriggerService>(TriggerService);

  const { triggerNodeFormMeta } = triggerService.getTriggerDynamicFormMeta();

  const { variableService } = context.playgroundContext;
  const { inputs, ...rest } = data;
  const { config, payload } = inputs ?? {};

  const DTOToVO = (dto?: ValueExpressionDTO): ValueExpression | undefined =>
    dto
      ? variableUtils?.valueExpressionToVO(
          dto,
          variableService as WorkflowVariableService,
        )
      : undefined;

  const arrayDTOToObjVO = (
    dto: InputValueDTO[],
  ): Record<string, ValueExpression> =>
    dto.reduce((acc, cur) => {
      const { name = '', input } = cur;
      acc[name] = DTOToVO(input);
      return acc;
    }, {});

  // 处理固定输入
  const fixedInputsVO: Record<string, ValueExpression> = {
    ...arrayDTOToObjVO(
      (config as InputValueDTO[]).filter(
        c => c?.name && fixedInputKeys.includes(c.name),
      ),
    ),
  };

  // 处理动态表单输入
  const dynamicInputsKeys = triggerNodeFormMeta
    .filter(
      d =>
        ![
          TriggerForm.TriggerFormCronjobName,
          TriggerForm.TriggerFormCronjobTypeName,
        ].includes(d.name),
    )
    ?.map(d => d.name);

  const dynamicInputsVO: DynamicInputsVO = {
    ...arrayDTOToObjVO(
      (config as InputValueDTO[]).filter(
        c => c?.name && dynamicInputsKeys.includes(c.name),
      ),
    ),
  };

  // hack 动态表单中 cronjob 的结构
  dynamicInputsVO[TriggerForm.TriggerFormCronjobName] = {
    type: ((config as InputValueDTO[])?.find(
      c => c?.name === TriggerForm.TriggerFormCronjobTypeName,
    )?.input?.value?.content ?? CronJobType.Selecting) as CronJobType,
    content: DTOToVO(
      (config as InputValueDTO[])?.find(
        c => c?.name === TriggerForm.TriggerFormCronjobName,
      )?.input,
    ),
  };

  // 处理绑定流程输入
  const payloadVO: Record<string, ValueExpression> = {
    ...arrayDTOToObjVO(payload as InputValueDTO[]),
  };

  const bindWorkflowId = (data.inputs?.meta as { workflowId?: string })
    ?.workflowId;

  return {
    inputs: {
      bindWorkflowId,
      fixedInputs: fixedInputsVO,
      dynamicInputs: dynamicInputsVO,
      payload: payloadVO,
    },
    ...rest,
  };
};

export const transformOnSubmit = (
  formData: NodeDataVO,
  context: NodeFormContext,
): NodeDataDTO => {
  const { variableService } = context.playgroundContext;

  const triggerService =
    context.node.getService<TriggerService>(TriggerService);

  const {
    [TriggerForm.TriggerFormEventIdName]: eventId,
    [TriggerForm.TriggerFormAppIdName]: appId,
  } = triggerService.getTriggerDynamicFormMeta();

  const outputs = get(formData, 'outputs', []) as any;
  const { inputs, nodeMeta } = formData;
  const { fixedInputs, dynamicInputs, bindWorkflowId, payload } = inputs ?? {};

  const VOToDTO = (
    name: string,
    vo: ValueExpression | string,
  ): InputValueDTO => {
    if (!ValueExpression.isExpression(vo as unknown as ValueExpression)) {
      return BlockInput.createString(name, vo as unknown as string);
    } else {
      return {
        name,
        input: variableUtils.valueExpressionToDTO(
          vo as unknown as ValueExpression,
          variableService as WorkflowVariableService,
          {
            node: context?.node,
          },
        ),
      };
    }
  };
  const objVOToArrayDTO = (
    obj: Record<string, ValueExpression>,
  ): InputValueDTO[] =>
    Object.entries(obj ?? {})?.map(([name, vo]) => VOToDTO(name, vo));

  const config: InputValueDTO[] = [];
  // 处理固定输入
  config.push(...objVOToArrayDTO(fixedInputs));

  // 处理动态表单输入
  // hack cronjob 类型：固定选择/手动输入
  config.push(
    BlockInput.createString(
      TriggerForm.TriggerFormCronjobTypeName,
      dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.type ??
        CronJobType.Selecting,
    ),
  );

  // hack cronjob 内容
  if (dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.content) {
    config.push(
      VOToDTO(
        TriggerForm.TriggerFormCronjobName,
        dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.content,
      ),
    );
  }

  // 处理动态表单输入
  config.push(
    ...objVOToArrayDTO(
      omit(dynamicInputs, [TriggerForm.TriggerFormCronjobName]),
    ),
  );

  //  处理绑定流程输入
  const _payload: InputValueDTO[] = [];
  if (bindWorkflowId) {
    const bindWorkflowInfo = triggerService.getBindWorkflowInfo(bindWorkflowId);
    const needSavePayloadKeys = (
      bindWorkflowInfo?.inputs as {
        name: string;
      }[]
    )?.map(d => d.name);
    _payload.push(...objVOToArrayDTO(pick(payload ?? {}, needSavePayloadKeys)));
  }

  const meta = {
    [TriggerForm.TriggerFormAppIdName]: appId,
    [TriggerForm.TriggerFormEventIdName]: eventId,
    workflowId: bindWorkflowId,
    triggerType: 'CRONJOB',
  };

  return {
    nodeMeta,
    inputs: {
      meta,
      config,
      payload: _payload,
    },
    outputs,
  };
};
