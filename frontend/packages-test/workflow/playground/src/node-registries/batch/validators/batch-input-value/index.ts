/* eslint-disable  @typescript-eslint/naming-convention*/
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';

export const BatchInputValueValidator = createValueExpressionInputValidate({
  required: true,
});
