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

import { z, type ZodSchema } from 'zod';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { jsonSchemaValidator } from '../json-schema-validator';
// Define Node Schema
const OutputTreeNodeSchema: ZodSchema<any> = z.lazy(() =>
  z
    .object({
      name: z
        .string({
          required_error: I18n.t('workflow_detail_node_error_name_empty'),
        })
        .min(1, I18n.t('workflow_detail_node_error_name_empty'))
        .regex(
          /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][a-zA-Z_$0-9]*$/,
          I18n.t('workflow_detail_node_error_format'),
        ),
      type: z.number(),
      children: z.array(OutputTreeNodeSchema).optional(),
      defaultValue: z.any().optional(),
    })
    .passthrough(),
);

export const OutputTreeSchema = z.array(OutputTreeNodeSchema);

// Define a helper function to find nodes with duplicate names and return the error path
const findDuplicates = (nodes, path = []) => {
  const seen = new Set();
  let result: {
    path: (string | number)[];
    message: string;
  };

  for (let i = 0; i < nodes.length; i++) {
    const { name } = nodes[i];
    if (seen.has(name)) {
      // Returns paths and error messages when duplicates are found
      result = {
        // @ts-expect-error -- linter-disable-autofix
        path: path.concat(i, 'name'),
        message: I18n.t('workflow_detail_node_error_variablename_duplicated'),
      };
      break;
    }
    seen.add(name);
    if (nodes[i].children) {
      // Recursively check sub-node
      const found = findDuplicates(
        nodes[i].children,
        // @ts-expect-error -- linter-disable-autofix
        path.concat(i, 'children'),
      );
      if (found) {
        result = found;
        break;
      }
    }
  }
  // @ts-expect-error -- linter-disable-autofix
  return result;
};

// Define a sibling-named unique tree structure schema
export const OutputTreeUniqueNameSchema = z
  .array(OutputTreeNodeSchema)
  .refine(
    data => {
      // Check with a custom function
      const duplicate = findDuplicates(data);
      return !duplicate;
    },
    data => {
      // Check with a custom function
      const duplicate = findDuplicates(data);
      return {
        path: duplicate.path,
        message: duplicate.message,
        // FIXME: The underlying layer of form validation relies on validation/code, so it won't work if you remove it.
        validation: 'regex',
        code: 'invalid_string',
      };
    },
  )
  .superRefine((data, ctx) => {
    // Check with a custom function
    const issues = checkObjectDefaultValue(data);
    issues.forEach(issue => {
      ctx.addIssue({
        path: issue.path,
        message: issue.message,
        // FIXME: The underlying layer of form validation relies on validation/code, so it won't work if you remove it.
        validation: 'regex',
        code: 'invalid_string',
      });
    });
  });

const checkObjectDefaultValue = nodes => {
  const result: Array<{
    path: (string | number)[];
    message: string;
  }> = [];

  for (let i = 0; i < nodes.length; i++) {
    const { defaultValue, type } = nodes[i];
    if (typeof defaultValue !== 'string' || !defaultValue) {
      continue;
    }
    if (!ViewVariableType.isJSONInputType(type)) {
      continue;
    }
    if (!jsonSchemaValidator(defaultValue, nodes[i])) {
      // Returns paths and error messages when duplicates are found
      result.push({
        path: [i, 'defaultValue'],
        message: I18n.t('workflow_debug_wrong_json'),
      });
    }
    // The JSON type only checks the first layer, no recursive check is required
  }
  return result;
};
// export type alias
export type OutputTree = z.infer<typeof OutputTreeSchema>;
