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

import React, { type FC, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useToolStore } from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';
import { type ShortcutFileInfo } from '@coze-arch/bot-api/playground_api';

import { FormInputWithMaxCount } from '../components';
import { type ShortcutEditFormValues } from '../../types';
import { validateButtonNameRepeat } from '../../../utils/tool-params';
import { ShortcutIconField } from './shortcut-icon';

export interface ButtonNameProps {
  editedShortcut: ShortcutEditFormValues;
}

export const ButtonName: FC<ButtonNameProps> = props => {
  const { existedShortcuts } = useToolStore(
    useShallow(state => ({
      existedShortcuts: state.shortcut.shortcut_list,
    })),
  );
  const { editedShortcut } = props;
  const [selectIcon, setSelectIcon] = useState<ShortcutFileInfo | undefined>(
    editedShortcut.shortcut_icon,
  );

  return (
    <FormInputWithMaxCount
      className="p-1"
      field="command_name"
      placeholder={I18n.t('shortcut_modal_button_name_input_placeholder')}
      prefix={
        <ShortcutIconField
          iconInfo={selectIcon}
          field="shortcut_icon"
          noLabel
          fieldClassName="!pb-0"
          onLoadList={list => {
            // If it is an editing state, do not set the default icon, and add the first icon in the default selected list.
            const isEdit = !!editedShortcut.command_id;
            if (isEdit) {
              return;
            }
            const defaultIcon = list.at(0);
            defaultIcon && setSelectIcon(defaultIcon);
          }}
        />
      }
      suffix={<></>}
      maxCount={20}
      maxLength={20}
      rules={[
        {
          required: true,
          message: I18n.t('shortcut_modal_button_name_is_required'),
        },
        {
          validator: (rule, value) =>
            validateButtonNameRepeat(
              {
                ...editedShortcut,
                command_name: value,
              },
              existedShortcuts ?? [],
            ),
          message: I18n.t('shortcut_modal_button_name_conflict_error'),
        },
      ]}
      noLabel
      required
    />
  );
};
