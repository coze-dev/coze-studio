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
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  data: NodeDataDTO,
  context: NodeFormContext,
) => {
  // Initialize to undefined and return directly. The defaultValue logic will be hit.
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

  // Handling Fixed Input
  const fixedInputsVO: Record<string, ValueExpression> = {
    ...arrayDTOToObjVO(
      (config as InputValueDTO[]).filter(
        c => c?.name && fixedInputKeys.includes(c.name),
      ),
    ),
  };

  // Handling dynamic form input
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

  // Hacking cronjob structure in dynamic form
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

  // Handle binding flow input
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
  // Handling Fixed Input
  config.push(...objVOToArrayDTO(fixedInputs));

  // Handling dynamic form input
  // Hack cronjob type: fixed selection/manual input
  config.push(
    BlockInput.createString(
      TriggerForm.TriggerFormCronjobTypeName,
      dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.type ??
        CronJobType.Selecting,
    ),
  );

  // Hack cronjob content
  if (dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.content) {
    config.push(
      VOToDTO(
        TriggerForm.TriggerFormCronjobName,
        dynamicInputs?.[TriggerForm.TriggerFormCronjobName]?.content,
      ),
    );
  }

  // Handling dynamic form input
  config.push(
    ...objVOToArrayDTO(
      omit(dynamicInputs, [TriggerForm.TriggerFormCronjobName]),
    ),
  );

  //  Handle binding flow input
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
