import React, { type FC } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze-arch/bot-semi';

import style from '../../index.module.less';
import FieldLabel from '../../components/field-label';
import {
  type ShortcutEditFormValues,
  type SkillsModalProps,
  type ToolInfo,
} from '../../../types';
import { getToolInfoByShortcut } from '../../../../utils/tool-params';
import { useToolAction } from './tool-action';

export interface ChooseSendTypeRadioProps {
  editedShortcut?: ShortcutEditFormValues;
  skillModal: FC<SkillsModalProps>;
  isBanned: boolean;
  onToolChange?: (tooInfo: ToolInfo | null) => void;
}

const { Checkbox } = Form;

export const SkillSwitch: FC<ChooseSendTypeRadioProps> = props => {
  const { editedShortcut, skillModal, isBanned, onToolChange } = props;
  const { action, open, cancel } = useToolAction({
    initTool: getToolInfoByShortcut(editedShortcut),
    onSelect: onToolChange,
    skillModal,
    isBanned,
  });

  return (
    <div
      className={cls(
        style['form-item'],
        style['shortcut-action-item'],
        'pb-[16px]',
      )}
    >
      <FieldLabel>{I18n.t('shortcut_modal_skill')}</FieldLabel>
      <div className="flex items-center justify-between h-[32px]">
        <Checkbox
          field="use_tool"
          onChange={e => {
            const { checked } = e.target;
            checked ? open() : cancel();
          }}
          noLabel
          fieldClassName="!pb-0"
        >
          {I18n.t('shortcut_modal_shortcut_action_use_plugin_wf')}
        </Checkbox>
        <div className="flex items-center">
          {editedShortcut?.use_tool ? action : null}
        </div>
      </div>
    </div>
  );
};
