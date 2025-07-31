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

import { isEmpty, isNil } from 'lodash-es';
import type { NodeContext } from '@flowgram-adapter/free-layout-editor';
import { nodeUtils } from '@coze-workflow/nodes';
import { type NodeDataDTO, type ValueExpression } from '@coze-workflow/base';

import { type FormData } from './types';

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (value: FormData, context: NodeContext) => {
  if (!value) {
    return {
      condition: [
        {
          condition: {
            logic: 2,
            conditions: [
              {
                left: undefined,
                operator: undefined,
                right: undefined,
              },
            ],
          },
        },
      ],
    };
  }

  const { inputs, ...others } = value || {};

  return {
    ...others,
    condition: !isNil(inputs?.branches)
      ? (inputs?.branches ?? []).map((branch, index) => ({
          condition: {
            logic: branch.condition.logic,
            conditions:
              branch.condition?.conditions?.map(item => {
                if (!('right' in item)) {
                  return {
                    operator: item.operator
                      ? Number(item.operator)
                      : item.operator,
                    left: nodeUtils.refExpressionDTOToVO(item.left, context),
                  };
                }

                return {
                  operator: item.operator
                    ? Number(item.operator)
                    : item.operator,
                  left: nodeUtils.refExpressionDTOToVO(item.left, context),
                  right: nodeUtils.refExpressionDTOToVO(item.right, context),
                };
              }) || [],
          },
        }))
      : undefined,
  };
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (
  value: FormData,
  context: NodeContext,
): NodeDataDTO => {
  const { condition, ...others } = value || {};

  const newValue: NodeDataDTO = {
    ...(others as NodeDataDTO),
  };

  newValue.inputs = {};

  if (condition && !isEmpty(condition)) {
    newValue.inputs.branches = condition.map(branch => ({
      condition: {
        logic: branch.condition.logic,
        conditions: branch.condition?.conditions?.map(item => {
          const left = nodeUtils.refExpressionToValueDTO(
            item.left as ValueExpression,
            context,
          );
          const right = nodeUtils.refExpressionToValueDTO(
            item.right as ValueExpression,
            context,
          );
          return {
            operator: item.operator,
            left,
            right,
          };
        }),
      },
    }));
  }

  return newValue;
};
