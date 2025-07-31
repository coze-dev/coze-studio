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
import { UIButton } from '@coze-arch/bot-semi';

import { useMerge } from '../use-merge';

export const MergeFooter = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void;
  onOk: () => Promise<void>;
}) => {
  const { handleMerge } = useMerge();

  return (
    <div className="flex justify-end my-6 space-x-3">
      <UIButton onClick={onCancel} type="tertiary">
        {I18n.t('Cancel')}
      </UIButton>

      <UIButton
        theme="solid"
        onClick={async () => {
          const merged = await handleMerge();
          if (merged) {
            await onOk();
          }
        }}
      >
        {I18n.t('Confirm')}
      </UIButton>
    </div>
  );
};
