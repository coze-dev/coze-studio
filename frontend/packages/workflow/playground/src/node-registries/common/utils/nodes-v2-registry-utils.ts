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
