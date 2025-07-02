/* eslint-disable @typescript-eslint/no-explicit-any */
import { set } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import { type NodeDataDTO } from '@coze-workflow/base';

import { LoopType } from './constants';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (formData: any, ctx: any) => {
  const inputParameters = formData?.inputs?.inputParameters;
  const outputValues = formData?.outputs;
  const loopCount = formData?.inputs?.loopCount;

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

  if (loopCount) {
    set(
      formData,
      'inputs.loopCount',
      variableUtils.valueExpressionToVO(
        loopCount,
        ctx.playgroundContext.variableService,
      ),
    );
  }

  return formData;
};

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (formData: any, ctx: any): NodeDataDTO => {
  const outputValues = formData?.outputs;
  const loopCount = formData?.inputs?.loopCount;
  const loopType: LoopType = formData?.inputs?.loopType;

  if (outputValues && Array.isArray(outputValues)) {
    outputValues.map((outputValue, index) => {
      const dto = variableUtils.inputValueToDTO(
        outputValue,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      );

      // 定制逻辑：如果选择了循环体内的变量，则输出变量的类型套一层 list
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

  if (loopCount) {
    set(
      formData,
      'inputs.loopCount',
      variableUtils.valueExpressionToDTO(
        loopCount,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      ),
    );
  }

  if (loopType !== LoopType.Array) {
    set(formData, 'inputs.inputParameters', []);
  }

  return formData;
};
