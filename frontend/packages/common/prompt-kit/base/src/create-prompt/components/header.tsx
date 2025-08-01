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
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { Tooltip, Divider, IconButton } from '@coze-arch/coze-design';
interface PromptHeaderProps {
  canEdit: boolean;
  onEditIconClick?: () => void;
  mode: 'info' | 'edit' | 'create';
}
export const PromptHeader = ({
  canEdit,
  onEditIconClick,
  mode,
}: PromptHeaderProps) => {
  if (mode === 'info' && canEdit) {
    return (
      <div className="flex items-center justify-between w-full">
        <span>{I18n.t('prompt_detail_prompt_detail')}</span>
        <div className="flex items-center ">
          <Tooltip content={I18n.t('prompt_library_edit')}>
            <IconButton
              color="secondary"
              icon={<IconCozEdit className="semi-icon-default" />}
              onClick={onEditIconClick}
              size="small"
            />
          </Tooltip>
          <Divider layout="vertical" className="mx-[10px] coz-stroke-primary" />
        </div>
      </div>
    );
  }
  if (mode === 'create') {
    return <>{I18n.t('creat_new_prompt')}</>;
  }

  if (mode === 'edit') {
    return <>{I18n.t('edit_prompt')}</>;
  }

  return <>{I18n.t('prompt_detail_prompt_detail')}</>;
};
