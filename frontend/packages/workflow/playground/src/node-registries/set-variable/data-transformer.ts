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
import { variableUtils } from '@coze-workflow/variable';
import {
  ValueExpressionType,
  type NodeDataDTO,
  type RefExpression,
  type ValueExpression,
  type ValueExpressionDTO,
} from '@coze-workflow/base';

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (formData: any, ctx: any) => {
  const inputParameterDTOs: {
    left: ValueExpressionDTO;
    right: ValueExpressionDTO;
  }[] = formData?.inputs?.inputParameters ?? [];

  const inputParameterVOs: {
    left: ValueExpression;
    right: ValueExpression;
  }[] = inputParameterDTOs
    .map(inputParameterDTO => {
      const leftVariableDTO = inputParameterDTO?.left;
      const rightVariableDTO = inputParameterDTO?.right;

      if (!leftVariableDTO || !rightVariableDTO) {
        return;
      }

      const leftVariableVO = variableUtils.valueExpressionToVO(
        leftVariableDTO,
        ctx.playgroundContext.variableService,
      );
      const rightVariableVO = variableUtils.valueExpressionToVO(
        rightVariableDTO,
        ctx.playgroundContext.variableService,
      );

      return {
        left: leftVariableVO,
        right: rightVariableVO,
      };
    })
    .filter(Boolean) as {
    left: ValueExpression;
    right: ValueExpression;
  }[];

  const defaultInputParameterVOs = [
    {
      left: {
        type: ValueExpressionType.REF,
      },
      right: {
        type: ValueExpressionType.REF,
      },
    },
  ];

  return {
    ...(formData ?? {}),
    inputs: {
      ...(formData?.inputs ?? {}),
      inputParameters:
        inputParameterVOs.length === 0
          ? defaultInputParameterVOs
          : inputParameterVOs,
    },
  };
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (formData: any, ctx: any): NodeDataDTO => {
  const inputParameterVOs: {
    left: ValueExpression;
    right: ValueExpression;
  }[] = formData?.inputs?.inputParameters ?? [];

  const inputParameterDTOs: {
    left: ValueExpressionDTO;
    right: ValueExpressionDTO;
  }[] = inputParameterVOs
    .map(inputParameterVO => {
      const leftVariableVO = inputParameterVO?.left as RefExpression;
      const rightVariableVO = inputParameterVO?.right as RefExpression;

      if (!leftVariableVO || !rightVariableVO) {
        return;
      }

      const leftKeyPath = leftVariableVO.content?.keyPath;
      const rightKeyPath = rightVariableVO.content?.keyPath;

      if (
        !leftKeyPath ||
        !rightKeyPath ||
        !leftKeyPath[0] ||
        !rightKeyPath[0]
      ) {
        return;
      }

      const leftVariableDTO = variableUtils.valueExpressionToDTO(
        leftVariableVO,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      );
      const rightVariableDTO = variableUtils.valueExpressionToDTO(
        rightVariableVO,
        ctx.playgroundContext.variableService,
        { node: ctx.node },
      );

      if (!leftVariableDTO || !rightVariableDTO) {
        return;
      }

      return {
        left: leftVariableDTO,
        right: rightVariableDTO,
      };
    })
    .filter(Boolean) as {
    left: ValueExpressionDTO;
    right: ValueExpressionDTO;
  }[];

  return {
    ...(formData ?? {}),
    inputs: {
      ...(formData?.inputs ?? {}),
      inputParameters: inputParameterDTOs,
    },
  };
};
