import { type InputValueVO } from '@coze-workflow/base';

/**
 * 是不是视觉理解的输入
 */
export const isVisionInput = (value: InputValueVO): boolean =>
  !!value?.input?.rawMeta?.isVision;
