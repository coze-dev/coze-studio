import { type WorkflowNodeRegistry } from '@coze-workflow/base';

import { withSettingOnError } from './with-setting-on-error';

const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (x: T) =>
    fns.reduce((v, f) => f(v), x);

export const nodeV2RegistryUtils = {
  processNodeRegistry(node: WorkflowNodeRegistry) {
    return compose(nodeV2RegistryUtils.setNodeSettingOnError)(node);
  },
  setNodeSettingOnError(node: WorkflowNodeRegistry) {
    return withSettingOnError(node);
  },
};
