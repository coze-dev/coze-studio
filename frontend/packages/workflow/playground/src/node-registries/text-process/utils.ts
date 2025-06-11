import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';

import { StringMethod } from './constants';

/**
 * Checks if the provided string method is a split method.
 *
 * @param {StringMethod} method - The string method to be checked.
 * @returns {boolean} Returns true if the method is a split method, false otherwise.
 */
export const isSplitMethod = (method: StringMethod) =>
  method === StringMethod.Split;

/**
 * Generates the default output configuration based on the provided string method.
 *
 * @param {StringMethod} method - The string method used to determine the output type.
 * @returns {Array<Object>} An array containing the default output configuration.
 */
export const getDefaultOutput = (method: StringMethod) => {
  const isSplit = isSplitMethod(method);
  return [
    {
      key: nanoid(),
      name: 'output',
      type: isSplit ? ViewVariableType.ArrayString : ViewVariableType.String,
      required: true,
    },
  ];
};
