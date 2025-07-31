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

import { keyBy } from 'lodash-es';
import { WorkflowNode } from '@coze-workflow/base';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { generateArrayInputParameters } from '../utils/generate-test-form-fields';
import { FieldName } from '../constants';

/**
 * Convert the content returned by copilot into form data
 * @param node
 * @param content
 * @returns
 */
export function generateCopilotFormData(
  node: WorkflowNodeEntity,
  content: string | undefined,
): Record<string, unknown> | undefined {
  if (!content) {
    return undefined;
  }
  const formFields = keyBy(
    generateArrayInputParameters(new WorkflowNode(node).inputParameters, {
      node,
    }),
    'name',
  );

  const data = Object.entries(JSON.parse(content)).reduce(
    (pre, [name, val]) => {
      const field = formFields[name];
      if (!field) {
        return pre;
      }

      // The value of the json editor needs to be converted to a string.
      if (field.component.type === 'JsonEditor') {
        val = JSON.stringify(val);
      }

      return {
        ...pre,
        [name]: val,
      };
    },
    {},
  );

  return {
    [FieldName.Node]: {
      [FieldName.Input]: data,
    },
  };
}
