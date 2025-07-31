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
import {
  ValueExpression,
  ValueExpressionType,
  type InputValueVO,
} from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type PlaygroundContext } from '@flowgram-adapter/free-layout-editor';

import { VARIABLE_NAME_REGEX } from '../constants';

type Path = string | number;

interface Issue {
  path: Path[];
  message: string;
}

/**
 * input tree validator
 */
export class InputTreeValidator {
  private node: FlowNodeEntity;
  private playgroundContext: PlaygroundContext;
  private issues: Issue[] = [];
  constructor(node: FlowNodeEntity, playgroundContext: PlaygroundContext) {
    this.node = node;
    this.playgroundContext = playgroundContext;
  }

  /**
   * check function
   * @param inputalues
   * @reurns
   */
  validate(inputValues: InputValueVO[]): Issue[] {
    this.issues = [];
    this.validateInputValues(inputValues);
    return this.issues;
  }

  /**
   * Validate multiple inputs
   * @param inputValues
   * @param path
   * @returns
   */
  private validateInputValues(inputValues: InputValueVO[], path: Path[] = []) {
    if (!inputValues) {
      return;
    }

    for (let i = 0; i < inputValues.length; i++) {
      const inputValue = inputValues[i] || {};
      const rules = {
        name: this.validateName,
        input: this.validateInput,
      };

      Object.keys(rules).forEach(key => {
        const message = rules[key].bind(this)({
          value: inputValue[key],
          values: inputValues,
        });

        if (message) {
          this.issues.push({
            message,
            path: path.concat(i, key),
          });
        }
      });

      const children = inputValues[i]?.children || [];
      // Recursively check sub-node
      this.validateInputValues(children, path.concat(i, 'children'));
    }
  }

  /**
   * input name validation
   */
  private validateName({ value, values }) {
    if (!value) {
      return I18n.t('workflow_detail_node_error_name_empty');
    }

    const names = values.map(v => v.name).filter(Boolean);
    // name format verification
    if (!VARIABLE_NAME_REGEX.test(value)) {
      return I18n.t('workflow_detail_node_error_format');
    }

    // duplicate name verification
    const foundSames = names.filter((name: string) => name === value);

    return foundSames.length > 1
      ? I18n.t('workflow_detail_node_input_duplicated')
      : undefined;
  }

  /**
   * input value validation
   */
  private validateInput({ value }) {
    const { variableValidationService } = this.playgroundContext;

    // check null value
    if (ValueExpression.isEmpty(value)) {
      return I18n.t('workflow_detail_node_error_empty');
    }

    if (value?.type === ValueExpressionType.REF) {
      return variableValidationService.isRefVariableEligible(value, this.node);
    }
  }
}

export function inputTreeValidator(params: ValidatorProps<InputValueVO>) {
  const {
    value,
    context: { playgroundContext, node },
  } = params;
  const validator = new InputTreeValidator(node, playgroundContext);

  const InputTreeNodeSchema: ZodSchema<any> = z.lazy(() =>
    z
      .object({
        name: z.string().optional(),
        input: z.any(),
        children: z.array(InputTreeNodeSchema).optional(),
      })
      .passthrough(),
  );

  const InputTreeSchema = z
    .array(InputTreeNodeSchema)
    .superRefine((data, ctx) => {
      const issues = validator.validate(data);

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

  const parsed = InputTreeSchema.safeParse(value);

  if (!parsed.success) {
    return JSON.stringify((parsed as any).error);
  }

  return true;
}
