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
import { IconButton } from '@coze-arch/coze-design';
import { IconAdd } from '@coze-arch/bot-icons';

import { type ISysConfigItemGroup } from '../../hooks';

const DEFAULT_VARIABLE_LENGTH = 10;
export const AddVariable = (props: {
  groupConfig?: ISysConfigItemGroup;
  isReadonly: boolean;
  hideAddButton?: boolean;
  forceShow?: boolean;
  handleInputedClick: () => void;
}) => {
  const {
    groupConfig,
    isReadonly,
    hideAddButton = false,
    forceShow = false,
    handleInputedClick,
  } = props;
  const enableVariables = groupConfig?.var_info_list ?? [];
  return (enableVariables.length < DEFAULT_VARIABLE_LENGTH &&
    !isReadonly &&
    !hideAddButton) ||
    forceShow ? (
    <div className="my-3 px-[22px] text-left">
      <IconButton
        className="!m-0"
        onClick={() => handleInputedClick()}
        icon={<IconAdd />}
      >
        {I18n.t('bot_userProfile_add')}
      </IconButton>
    </div>
  ) : null;
};
