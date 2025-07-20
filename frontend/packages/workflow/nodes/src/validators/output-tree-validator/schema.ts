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
// 定义节点Schema
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

// 定义一个辅助函数，用于查找重复名字的节点并返回错误路径
const findDuplicates = (nodes, path = []) => {
  const seen = new Set();
  let result: {
    path: (string | number)[];
    message: string;
  };

  for (let i = 0; i < nodes.length; i++) {
    const { name } = nodes[i];
    if (seen.has(name)) {
      // 找到重复项时返回路径和错误信息
      result = {
        // @ts-expect-error -- linter-disable-autofix
        path: path.concat(i, 'name'),
        message: I18n.t('workflow_detail_node_error_variablename_duplicated'),
      };
      break;
    }
    seen.add(name);
    if (nodes[i].children) {
      // 递归检查子节点
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

// 定义同级命名唯一的树结构Schema
export const OutputTreeUniqueNameSchema = z
  .array(OutputTreeNodeSchema)
  .refine(
    data => {
      // 使用自定义函数进行检查
      const duplicate = findDuplicates(data);
      return !duplicate;
    },
    data => {
      // 使用自定义函数进行检查
      const duplicate = findDuplicates(data);
      return {
        path: duplicate.path,
        message: duplicate.message,
        // FIXME: 表单校验底层依赖了 validation / code，去掉就跑不通了
        validation: 'regex',
        code: 'invalid_string',
      };
    },
  )
  .superRefine((data, ctx) => {
    // 使用自定义函数进行检查
    const issues = checkObjectDefaultValue(data);
    issues.forEach(issue => {
      ctx.addIssue({
        path: issue.path,
        message: issue.message,
        // FIXME: 表单校验底层依赖了 validation / code，去掉就跑不通了
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
      // 找到重复项时返回路径和错误信息
      result.push({
        path: [i, 'defaultValue'],
        message: I18n.t('workflow_debug_wrong_json'),
      });
    }
    // json 类型只检查第一层，不需要递归检查
  }
  return result;
};
// 导出类型别名
export type OutputTree = z.infer<typeof OutputTreeSchema>;
