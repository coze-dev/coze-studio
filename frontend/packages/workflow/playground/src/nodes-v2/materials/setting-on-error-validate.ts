import { type Validate } from '@flowgram-adapter/free-layout-editor';
import { settingOnErrorValidator } from '@coze-workflow/nodes';

/**
 * 异常设置校验
 * @param param0
 * @returns
 */
export const settingOnErrorValidate: Validate = ({ value, context }) => {
  const res = settingOnErrorValidator({
    value,
    context,
    options: {},
  });

  if (res === true) {
    return;
  }

  return res;
};
