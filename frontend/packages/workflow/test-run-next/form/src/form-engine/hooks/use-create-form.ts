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

import { useEffect, useMemo } from 'react';

import {
  createForm,
  ValidateTrigger,
} from '@flowgram-adapter/free-layout-editor';

import type { IFormSchema, IFormSchemaValidate } from '../types';
import { FormSchema } from '../shared';

type Rules = Record<string, IFormSchemaValidate>;

const getFieldPath = (...args: (string | undefined)[]) =>
  args.filter(path => path).join('.');

export function validateResolver(schema: IFormSchema): Rules {
  const rules = {};

  visit(schema);

  return rules;

  function visit(current: IFormSchema, name?: string) {
    if (name && current['x-validator']) {
      rules[name] = current['x-validator'];
    }
    if (current.type === 'object' && current.properties) {
      Object.entries(current.properties).forEach(([key, value]) => {
        visit(value, getFieldPath(name, key));
      });
    }
  }
}

export const useCreateForm = (schema: IFormSchema, options: any = {}) => {
  const { validate } = options;
  const innerValidate = useMemo(
    () => ({
      ...validateResolver(schema),
      ...validate,
    }),
    [schema],
  );
  const { form, control } = useMemo(
    () =>
      createForm({
        validate: innerValidate,
        validateTrigger: ValidateTrigger.onBlur,
        ...options,
      }),
    [schema, innerValidate],
  );
  const formSchema = useMemo(
    () => new FormSchema({ type: 'object', ...schema }),
    [schema],
  );

  useEffect(() => {
    if (options.onMounted) {
      options.onMounted(control._formModel, formSchema);
    }
    const disposable = control._formModel.onFormValuesUpdated(payload => {
      if (options?.onFormValuesChange) {
        options.onFormValuesChange(payload);
      }
    });
    return () => disposable.dispose();
  }, [control]);

  return {
    form,
    control,
    model: control._formModel,
    formSchema,
  };
};
