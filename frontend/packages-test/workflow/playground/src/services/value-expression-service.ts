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
