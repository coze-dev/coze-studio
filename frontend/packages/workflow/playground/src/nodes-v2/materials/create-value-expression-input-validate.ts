import { isFunction, isBoolean } from 'lodash-es';

import { valueExpressionValidator } from '@/form-extensions/validators';

interface Options {
  /** required 还支持函数形式验证 */
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
