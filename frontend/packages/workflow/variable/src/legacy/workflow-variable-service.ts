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
 
import { inject, injectable } from 'inversify';
import { EntityManager } from '@flowgram-adapter/free-layout-editor';
import { type Disposable } from '@flowgram-adapter/common';
import {
  type DTODefine,
  type RefExpression,
  type ValueExpressionDTO,
  ValueExpressionType,
  type ViewVariableMeta,
  ViewVariableType,
} from '@coze-workflow/base';

import { type GetKeyPathCtx } from '../core/types';
import { type WorkflowVariable, WorkflowVariableFacadeService } from '../core';
import { type GlobalVariableKey, isGlobalVariableKey } from '../constants';

/**
 * 变量相关服务
 */
@injectable()
export class WorkflowVariableService {
  @inject(EntityManager) protected readonly entityManager: EntityManager;

  @inject(WorkflowVariableFacadeService)
  protected readonly variableFacadeService: WorkflowVariableFacadeService;

  /**
   * 表达式引用转后端，如果无数据，默认给一个空的 ref 引用
   * 输入：
   * {
   *   type: ValueExpressionType.REF,
   *   content: {
   *     keyPath: ['nodeId', 'xxx', 'xxx']
   *   }
   *
   * }
   */
  refExpressionToDTO(
    refExpression: RefExpression | undefined,
    ctx: GetKeyPathCtx,
  ): ValueExpressionDTO {
    const keyPath = refExpression?.content?.keyPath || [];

    const workflowVariable =
      this.variableFacadeService.getVariableFacadeByKeyPath(keyPath, ctx);

    const dtoMeta = workflowVariable?.dtoMeta;

    // 如果引用的变量，属于全局变量
    if (isGlobalVariableKey(keyPath[0])) {
      const path = workflowVariable
        ? [
            ...workflowVariable.parentVariables
              .slice(1)
              .map(_variable => {
                // Hack: 全局变量特化逻辑，后端要求数组下钻把数组的下标也带上
                if (
                  _variable.viewType &&
                  ViewVariableType.isArrayType(_variable.viewType)
                ) {
                  return [_variable.key, '[0]'];
                }

                return [_variable.key];
              })
              .flat(),
            workflowVariable.key,
          ]
        : // 没有 workflowVariable，则直接使用原来的 keyPath
          keyPath.slice(1);

      return {
        type: dtoMeta?.type || 'string',
        schema: dtoMeta?.schema,
        assistType: dtoMeta?.assistType,
        value: {
          type: 'ref',
          content: {
            source: keyPath[0] as GlobalVariableKey,
            path,
            blockID: '',
            name: '',
          },
        },
      };
    }

    return {
      type: dtoMeta?.type || 'string',
      schema: dtoMeta?.schema,
      assistType: dtoMeta?.assistType,
      value: {
        type: 'ref',
        content: {
          source: 'block-output',
          blockID: keyPath[0] || '',
          name: keyPath.slice(1).join('.'),
        },
      },
    };
  }

  /**
   * 表达式引用转前端
   * @param value
   */
  refExpressionToVO(valueDTO: ValueExpressionDTO): RefExpression {
    const value = valueDTO?.value as DTODefine.RefExpression;
    if (!value) {
      return {
        type: ValueExpressionType.REF,
        content: {
          keyPath: [],
        },
      };
    }

    if (value.content?.source?.startsWith('global_variable_')) {
      const { source, path } =
        (value.content as {
          source: `global_variable_${string}`;
          path: string[];
        }) || {};
      return {
        type: ValueExpressionType.REF,
        content: {
          keyPath: [
            source,
            // Hack: 全局变量特化逻辑，后端要求数组下钻把数组的下标也带上，前端不需要 [0] 下钻，因此转化时过滤掉
            ...(path || []).filter(_v => !['[0]'].includes(_v)),
          ],
        },
      };
    }

    const name = value.content?.name || '';
    const nameList = name.split('.').filter(Boolean); // 过滤空字符串

    // 灰度命中时，直接使用 namePath
    return {
      type: ValueExpressionType.REF,
      content: {
        keyPath: [value.content?.blockID || '', ...nameList],
      },
    };
  }

  /**
   * 直接返回 Variable 或者 SubVariable 的 ViewVariableMeta
   * @param keyPath ViewVariableMeta 的 keyPath 路径
   * @returns
   */
  getViewVariableByKeyPath(
    keyPath: string[] | undefined,
    ctx: GetKeyPathCtx,
  ): ViewVariableMeta | null {
    return (
      this.variableFacadeService.getVariableFacadeByKeyPath(keyPath, ctx)
        ?.viewMeta || null
    );
  }

  getWorkflowVariableByKeyPath(
    keyPath: string[] | undefined,
    ctx: GetKeyPathCtx,
  ): WorkflowVariable | undefined {
    return this.variableFacadeService.getVariableFacadeByKeyPath(keyPath, ctx);
  }

  /**
   * 监听指定 keyPath 变量类型变化
   * @param keyPath
   * @param cb
   * @returns
   */
  onListenVariableTypeChange(
    keyPath: string[],
    cb: (v?: ViewVariableMeta | null) => void,
    ctx: GetKeyPathCtx,
  ): Disposable {
    return this.variableFacadeService.listenKeyPathTypeChange(keyPath, cb, ctx);
  }

  /**
   * @deprecated 变量销毁存在部分 Bad Case
   * - 全局变量因切换 Project 销毁后，变量引用会被置空，导致变量引用失效
   *
   * 监听指定 keyPath 变量类型变化
   * @param keyPath
   * @param cb
   * @returns
   */
  onListenVariableDispose(
    keyPath: string[],
    cb: () => void,
    ctx: GetKeyPathCtx,
  ): Disposable {
    return this.variableFacadeService.listenKeyPathDispose(keyPath, cb, ctx);
  }

  /**
   * 监听指定 keyPath 变量的变化
   * @param keyPath
   * @param cb
   * @returns
   */
  onListenVariableChange(
    keyPath: string[],
    cb: (v?: ViewVariableMeta | null) => void,
    ctx: GetKeyPathCtx,
  ): Disposable {
    return this.variableFacadeService.listenKeyPathVarChange(keyPath, cb, ctx);
  }
}
