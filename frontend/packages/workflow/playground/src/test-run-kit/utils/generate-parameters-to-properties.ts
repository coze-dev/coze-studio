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
import { isGlobalVariableKey } from '@coze-workflow/variable';
import { getSortedInputParameters } from '@coze-workflow/nodes';
import { ValueExpressionType } from '@coze-workflow/base';

import { isStaticObjectRef } from '@/components/test-run/utils/is-static-object-ref';

import type { WorkflowNodeEntity } from '../types';
import { generateInputToField } from './generate-input-to-field';

export const generateParametersToProperties = (
  parameters: any[],
  { node }: { node: WorkflowNodeEntity },
) => {
  if (!parameters || !Array.isArray(parameters)) {
    return {};
  }

  const fields = parameters.filter(i => {
    /** Object reference types do not need to be filtered, all static fields need to be filtered */
    if (i.input?.type === ValueExpressionType.OBJECT_REF) {
      return !isStaticObjectRef(i);
    }
    /** Direct filtering of non-reference types, no direct filtering of reference values */
    if (i.input?.type !== 'ref' || !i.input?.content) {
      return false;
    }
    /** If the reference is from itself, there is no need to fill it in */
    const [nodeId] = i.input.content.keyPath || [];
    if (nodeId && nodeId === node.id) {
      return false;
    }
    if (isGlobalVariableKey(nodeId)) {
      return false;
    }

    return true;
  });
  const sortedFields = getSortedInputParameters(fields);

  return sortedFields
    .map(field => generateInputToField(field, { node }))
    .reduce((properties, field) => {
      if (field.name) {
        properties[field.name] = field;
      }
      return properties;
    }, {});
};
