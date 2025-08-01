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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty, IconCozBroom } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

interface WorkspaceEmptyProps {
  onClear?: () => void; // Clear button click event
  hasFilter?: boolean; // Is there a filter
}

export const WorkspaceEmpty: FC<WorkspaceEmptyProps> = ({
  onClear,
  hasFilter = false,
}) => (
  <div className="w-full h-full flex flex-col items-center pt-[120px]">
    <IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />
    <div className="text-[16px] font-[500] leading-[22px] mt-[8px] mb-[16px] coz-fg-primary">
      {I18n.t(
        hasFilter ? 'library_empty_no_results_found_under' : 'search_not_found',
      )}
    </div>
    {hasFilter ? (
      <Button
        color="primary"
        icon={<IconCozBroom />}
        onClick={() => {
          onClear?.();
        }}
      >
        {I18n.t('library_empty_clear_filters')}
      </Button>
    ) : null}
  </div>
);
