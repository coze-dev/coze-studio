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
 * Variable related services
 */
@injectable()
export class WorkflowVariableService {
  @inject(EntityManager) protected readonly entityManager: EntityManager;

  @inject(WorkflowVariableFacadeService)
  protected readonly variableFacadeService: WorkflowVariableFacadeService;

  /**
   * The expression reference is transferred to the backend. If there is no data, an empty ref reference is given by default.
   * Input:
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

    // If the referenced variable is a global variable
    if (isGlobalVariableKey(keyPath[0])) {
      const path = workflowVariable
        ? [
            ...workflowVariable.parentVariables
              .slice(1)
              .map(_variable => {
                // Hack: Global variable specialization logic, the backend requires the array to drill down and bring the index of the array
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
        : // If there is no workflowVariable, use the original keyPath directly.
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
   * expression reference to frontend
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
            // Hack: Global variable specialization logic, the backend requires the array to drill down and bring the index of the array. The front end does not need [0] to drill down, so it is filtered out during conversion.
            ...(path || []).filter(_v => !['[0]'].includes(_v)),
          ],
        },
      };
    }

    const name = value.content?.name || '';
    const nameList = name.split('.').filter(Boolean); // Filter empty strings

    // When grey releases hits, use namePath directly
    return {
      type: ValueExpressionType.REF,
      content: {
        keyPath: [value.content?.blockID || '', ...nameList],
      },
    };
  }

  /**
   * Directly returns the ViewVariableMeta of Variable or SubVariable
   * @param keyPath ViewVariableMeta keyPath
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
   * Listens for changes in the specified keyPath variable type
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
   * @Deprecated Variable Destruction Partial Bad Case
   * - After the global variable is destroyed due to the switch Project, the variable reference will be set empty, resulting in the invalidation of the variable reference
   *
   * Listens for changes in the specified keyPath variable type
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
   * Listens for changes in the specified keyPath variable
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
