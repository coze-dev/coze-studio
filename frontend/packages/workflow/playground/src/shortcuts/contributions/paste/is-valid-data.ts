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

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { type WorkflowGlobalStateEntity } from '@/typing';

import { type WorkflowClipboardData } from '../../type';
import { WORKFLOW_CLIPBOARD_TYPE } from '../../constant';

/** Check if the data is legitimate */
export const isValidData = (params: {
  data: WorkflowClipboardData;
  globalState: WorkflowGlobalStateEntity;
}): boolean => {
  const { data, globalState } = params;
  if (data.type !== WORKFLOW_CLIPBOARD_TYPE) {
    return false;
  }
  // The cross-domain name represents different environments, and the plug-ins on the shelves are different and cannot be copied.
  if (data.source.host !== window.location.host) {
    return false;
  }
  // Douyin space is not compatible with normal space
  if (data.source.isDouyin !== globalState.isBindDouyin) {
    Toast.warning({
      content: I18n.t(
        'workflow_node_copy_othercanva',
        {},
        '当前画布类型不一致，无法粘贴',
      ),
      showClose: false,
    });
    return false;
  }
  // Different canvas types cannot be copied
  if (data.source.flowMode !== globalState.flowMode) {
    Toast.warning({
      content: I18n.t(
        'workflow_node_copy_othercanva',
        {},
        '当前画布类型不一致，无法粘贴',
      ),
      showClose: false,
    });
    return false;
  }
  return true;
};
