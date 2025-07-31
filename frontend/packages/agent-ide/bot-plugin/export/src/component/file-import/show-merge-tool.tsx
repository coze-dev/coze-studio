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
import { UIModal } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import { type DuplicateAPIInfo } from '@coze-arch/bot-api/plugin_develop';

interface MergeToolInfoProps {
  onOk?: () => void;
  onCancel?: () => void;
  duplicateInfos?: DuplicateAPIInfo[];
}

export function showMergeTool({
  duplicateInfos = [],
  onCancel,
  onOk,
}: MergeToolInfoProps) {
  UIModal.warning({
    title: I18n.t('duplicate_tools_within_plugin'),
    content: duplicateInfos?.map(item => (
      <div>{`${item.method}  ${I18n.t('path_has_duplicates', {
        path: item.path,
        num: item.count,
      })}`}</div>
    )),
    okText: I18n.t('merge_duplicate_tools'),
    cancelText: I18n.t('Cancel'),
    centered: true,
    icon: <IconWarningInfo />,
    okButtonProps: {
      type: 'warning',
    },
    onOk,
    onCancel,
  });
}
