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
import { injectable, inject } from 'inversify';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ValueExpression,
  type ValueExpressionDTO,
  type RefExpression,
  ValueExpressionType,
  WorkflowVariableService,
  variableUtils,
} from '@coze-workflow/variable';
import { ValueExpression as ValueExpressionUtils } from '@coze-workflow/base';

import { type ValueExpressionService } from './value-expression-service';

@injectable()
export class ValueExpressionServiceImpl implements ValueExpressionService {
  @inject(WorkflowVariableService)
  private readonly variableService: WorkflowVariableService;

  public isValueExpression(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    return ValueExpressionUtils.isExpression(value as ValueExpression);
  }

  public isValueExpressionDTO(value: unknown): boolean {
    return (
      (typeof value === 'object' &&
        value !== null &&
        (value as any).value?.type === ValueExpressionType.REF) ||
      (value as any).value?.type === ValueExpressionType.LITERAL
    );
  }

  public isRefExpression(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    return ValueExpressionUtils.isRef(value as ValueExpression);
  }

  public isLiteralExpression(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    return ValueExpressionUtils.isLiteral(value as ValueExpression);
  }

  // Convert ValueExpression to ValueExpressionDTO
  public toDTO(
    valueExpression?: ValueExpression,
    currentNode?: FlowNodeEntity,
  ): ValueExpressionDTO | undefined {
    if (!valueExpression) {
      return undefined;
    }

    const dto = variableUtils.valueExpressionToDTO(
      valueExpression,
      this.variableService,
      { node: currentNode },
    );

    return dto;
  }

  // Generating ValueExpression from ValueExpressionDTO
  public toVO(dto?: ValueExpressionDTO): ValueExpression | undefined {
    if (!dto) {
      return undefined;
    }

    const vo = variableUtils.valueExpressionToVO(dto, this.variableService);

    return vo;
  }

  public isRefExpressionVariableExists(
    value: RefExpression,
    node: FlowNodeEntity,
  ): boolean {
    const variable = this.variableService.getViewVariableByKeyPath(
      value?.content?.keyPath,
      {
        node,
      },
    );

    const isValidVariable = variable !== null && variable !== undefined;

    return isValidVariable;
  }
}
