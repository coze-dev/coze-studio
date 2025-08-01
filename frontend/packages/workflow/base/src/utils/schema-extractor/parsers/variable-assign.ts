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

import { type SchemaExtractorVariableAssignParser } from '../type';
import { type ValueExpressionDTO, type DTODefine } from '../../../types';

const getValueExpressionName = (
  valueExpression: ValueExpressionDTO,
): string | undefined => {
  const content = valueExpression?.value?.content as
    | DTODefine.RefExpressionContent
    | string;
  if (!content) {
    return;
  }
  if (typeof content === 'string') {
    return content;
  } else if (typeof content === 'object') {
    if (content.source === 'block-output' && typeof content.name === 'string') {
      return content.name;
    } else if (
      typeof content.source === 'string' &&
      content.source.startsWith('global_variable')
    ) {
      return (
        content as {
          source: `global_variable_${string}`;
          path: string[];
          blockID: string;
          name: string;
        }
      )?.path?.join('.');
    }
  }
};

export const variableAssignParser: SchemaExtractorVariableAssignParser =
  variableAssigns => {
    if (!Array.isArray(variableAssigns)) {
      return [];
    }

    return variableAssigns
      .map(variableAssign => {
        const leftContent = getValueExpressionName(variableAssign.left);
        const rightContent = getValueExpressionName(variableAssign.right);
        // Rvalue field of variable assignment node
        const inputContent = variableAssign.input
          ? getValueExpressionName(variableAssign.input)
          : null;
        return {
          name: leftContent ?? '',
          value: rightContent ?? inputContent ?? '',
        };
      })
      .filter(Boolean) as ReturnType<SchemaExtractorVariableAssignParser>;
  };
