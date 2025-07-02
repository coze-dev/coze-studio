import { get } from 'lodash-es';

import { valueExpressionValidator } from '@/form-extensions/validators';

import { AuthType, authTypeToField } from '../constants';

export function createAuthValidator() {
  const validators = {};
  Object.keys(AuthType).forEach(key => {
    const subPath = key === 'Custom' ? '.data.*.input' : '.*.input';
    const pathName = `inputs.auth.authData.${authTypeToField[AuthType[key]] + subPath}`;
    validators[pathName] = ({ value, formValues, context }) => {
      const authOpen = get(formValues, 'inputs.auth.authOpen');
      const authType: AuthType = get(formValues, 'inputs.auth.authType');
      if (!authOpen || authType !== AuthType[key]) {
        return undefined;
      }
      const { playgroundContext, node } = context;

      return valueExpressionValidator({
        value,
        playgroundContext,
        node,
        required: true,
      });
    };
  });
  return validators;
}
