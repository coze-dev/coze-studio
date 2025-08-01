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

import { get } from 'lodash-es';

import { valueExpressionValidator } from '@/form-extensions/validators';

import { AuthType, authTypeToField } from '../constants';

export function createAuthValidator() {
  const validators = {};
  Object.keys(AuthType).forEach(key => {
    const subPath = key === 'Custom' ? '.data.*.input' : '.*.input';
    const pathName = `inputs.auth.authData.${
      authTypeToField[AuthType[key]] + subPath
    }`;
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
