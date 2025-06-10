import { type Validate } from '@flowgram-adapter/free-layout-editor';
import { nodeMetaValidator } from '@coze-workflow/nodes';

/**
 * node meta 校验
 * @param param0
 * @returns
 */
export const nodeMetaValidate: Validate = ({ value, context }) => {
  const res = nodeMetaValidator({
    value,
    context,
    options: {},
  });

  if (res === true) {
    return;
  }

  return res;
};
