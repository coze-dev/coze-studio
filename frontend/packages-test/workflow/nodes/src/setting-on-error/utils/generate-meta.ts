import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';

import { ERROR_BODY_NAME, IS_SUCCESS_NAME } from '../constants';

export const generateErrorBodyMeta = () => ({
  key: nanoid(),
  name: ERROR_BODY_NAME,
  type: ViewVariableType.Object,
  readonly: true,
  children: [
    {
      key: nanoid(),
      name: 'errorMessage',
      type: ViewVariableType.String,
      readonly: true,
    },
    {
      key: nanoid(),
      name: 'errorCode',
      type: ViewVariableType.String,
      readonly: true,
    },
  ],
});

export const generateIsSuccessMeta = () => ({
  key: nanoid(),
  name: IS_SUCCESS_NAME,
  type: ViewVariableType.Boolean,
  readonly: true,
});
