import { useEffect, useMemo } from 'react';

import { createForm, ValidateTrigger } from '@flowgram-adapter/free-layout-editor';

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
