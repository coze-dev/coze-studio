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

import { isFunction, isBoolean } from 'lodash-es';

import { valueExpressionValidator } from '@/form-extensions/validators';

interface Options {
  /** Required also supports functional formal verification */
  required?: boolean | ((validateProps) => boolean);
  emptyErrorMessage?: string;
  skipValidate?: ({ value, formValues }) => boolean;
}

export const createValueExpressionInputValidate =
  ({ required, emptyErrorMessage, skipValidate }: Options) =>
  ({ name, value, formValues, context }) => {
    const { playgroundContext, node } = context;
    let computeRequired = false;

    if (skipValidate?.({ value, formValues })) {
      return;
    }

    if (isBoolean(required)) {
      computeRequired = required;
    }

    if (isFunction(required)) {
      computeRequired = required({ name, value, formValues, context });
    }

    return valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required: computeRequired,
      emptyErrorMessage,
    });
  };
