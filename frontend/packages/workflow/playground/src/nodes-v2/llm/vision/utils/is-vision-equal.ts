import { type InputValueVO } from '@coze-workflow/base';

import { isVisionInput } from './is-vision-input';

/**
 * 判断是否是相同的输入类型
 * @param value1
 * @param value2
 * @returns
 */
export const isVisionEqual = (
  value1: InputValueVO,
  value2: InputValueVO,
): boolean => isVisionInput(value1) === isVisionInput(value2);
