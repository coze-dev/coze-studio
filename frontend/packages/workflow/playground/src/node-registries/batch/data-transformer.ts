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
import { set } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import { type NodeDataDTO } from '@coze-workflow/base';

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (formData: any, ctx: any) => {
  const inputParameters = formData?.inputs?.inputParameters;
  const outputValues = formData?.outputs;
  const concurrentSize = formData?.inputs?.concurrentSize;
  const batchSize = formData?.inputs?.batchSize;

  if (!Array.isArray(inputParameters) || inputParameters?.length === 0) {
    set(formData, 'inputs.inputParameters', [{ name: 'input' }]);
  }

  if (outputValues && Array.isArray(outputValues)) {
    outputValues.map((outputValue, index) => {
      set(
        outputValues,
        index,
        variableUtils.inputValueToVO(
          outputValue,
          ctx.playgroundContext.variableService,
        ),
      );
    });
  }

  if (concurrentSize) {
    set(
      formData,
      'inputs.concurrentSize',
      variableUtils.valueExpressionToVO(
        concurrentSize,
        ctx.playgroundContext.variableService,
      ),
    );
  }

  if (batchSize) {
    set(
      formData,
      'inputs.batchSize',
      variableUtils.valueExpressionToVO(
        batchSize,
        ctx.playgroundContext.variableService,
      ),
    );
  }

  return formData;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (formData: any, ctx: any): NodeDataDTO => {
  const outputValues = formData?.outputs;
  const concurrentSize = formData?.inputs?.concurrentSize;
  const batchSize = formData?.inputs?.batchSize;

  if (outputValues && Array.isArray(outputValues)) {
    outputValues.map((outputValue, index) => {
      const dto = variableUtils.inputValueToDTO(
        outputValue,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      );

      // Custom logic: If a variable inside the loop is selected, a list of the type of the output variable is set
      if (
        outputValue?.input?.content?.keyPath?.[0] !== ctx.node.id &&
        dto?.input
      ) {
        set(dto, 'input.schema', {
          type: dto.input?.type,
          schema: dto.input?.schema,
        });
        set(dto, 'input.type', 'list');
      }

      set(outputValues, index, dto);
    });
    set(formData, 'outputs', outputValues.filter(Boolean));
  }

  if (concurrentSize) {
    set(
      formData,
      'inputs.concurrentSize',
      variableUtils.valueExpressionToDTO(
        concurrentSize,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      ),
    );
  }

  if (batchSize) {
    set(
      formData,
      'inputs.batchSize',
      variableUtils.valueExpressionToDTO(
        batchSize,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      ),
    );
  }

  return formData;
};
