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
import {
  type ValueExpression,
  type ValueExpressionDTO,
  type RefExpression,
} from '@coze-workflow/variable';

export abstract class ValueExpressionService {
  /**
   * 判断值是否为值表达式
   * @param value 值
   * @returns 是否为值表达式
   */
  abstract isValueExpression(value: unknown): boolean;

  /**
   * 判断值是否为值表达式DTO
   * @param value 值
   * @returns 是否为值表达式DTO
   */
  abstract isValueExpressionDTO(value: unknown): boolean;

  /**
   * 判断值是否为引用表达式
   * @param value 值
   * @returns 是否为引用表达式
   */
  abstract isRefExpression(value: unknown): boolean;

  /**
   * 判断值是否为字面量表达式
   * @param value 值
   * @returns 是否为字面量表达式
   */
  abstract isLiteralExpression(value: RefExpression): boolean;

  /**
   * 判断引用表达式变量是否存在
   * @param value 引用表达式
   * @param node 当前节点
   * @returns 是否存在
   */
  abstract isRefExpressionVariableExists(
    value: RefExpression,
    node: FlowNodeEntity,
  ): boolean;

  /**
   * 将值表达式转换为DTO
   * @param valueExpression 值表达式
   * @param currentNode 当前节点
   * @returns 值表达式DTO
   */
  abstract toDTO(
    valueExpression?: ValueExpression,
    currentNode?: FlowNodeEntity,
  ): ValueExpressionDTO | undefined;

  /**
   * 将值表达式DTO转换为值表达式
   * @param dto 值表达式DTO
   * @returns 值表达式
   */
  abstract toVO(dto?: ValueExpressionDTO): ValueExpression | undefined;
}
