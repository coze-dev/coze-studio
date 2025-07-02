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
            // 如果是编辑状态，不设置默认icon, 新增下默认选中列表第一个icon
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
