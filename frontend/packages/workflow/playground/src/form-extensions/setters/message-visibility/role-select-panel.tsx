import { type FC, useState } from 'react';

import { concatTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Radio } from '@coze/coze-design';

import {
  type UserSettings,
  type RoleSelectHandler,
  type RoleSetting,
  type NicknameVariableSetting,
} from './types';
import { PlayerCheckboxGroup } from './player-checkbox-group';
import { NicknameVariableCheckboxGroup } from './nickname-variable-checkbox-group';
import { useMessageVisibilityContext } from './context';

import styles from './role-select-panel.module.less';

const RadioGroup = Radio.Group;

interface RoleSelectPanelProps {
  onSelect: RoleSelectHandler;
}

enum RoleType {
  Player = '1',
  NicknameVariable = '2',
}

const getInitialRoleType = (userSettings?: UserSettings) => {
  if (!userSettings || !userSettings.length) {
    return RoleType.Player;
  } else {
    if (userSettings?.every(item => !!item.biz_role_id)) {
      return RoleType.Player;
    } else {
      return RoleType.NicknameVariable;
    }
  }
};

export const RoleSelectPanel: FC<RoleSelectPanelProps> = props => {
  const { value, testId } = useMessageVisibilityContext();
  const { onSelect } = props;

  const [roleType, setRoleType] = useState(
    getInitialRoleType(value?.user_settings),
  );

  const [selectedSettings, setSelectedSettings] = useState<{
    [RoleType.Player]: RoleSetting[] | undefined;
    [RoleType.NicknameVariable]: NicknameVariableSetting[] | undefined;
  }>({
    [RoleType.Player]:
      getInitialRoleType(value?.user_settings) === RoleType.Player
        ? (value?.user_settings as RoleSetting[])
        : [],
    [RoleType.NicknameVariable]:
      getInitialRoleType(value?.user_settings) === RoleType.NicknameVariable
        ? (value?.user_settings as NicknameVariableSetting[])
        : [],
  });

  const handleRadioChange = e => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(selectedSettings[e.target.value]);
    setRoleType(e.target.value);
  };

  const handleSelect = (_roleType: RoleType) => (_value: UserSettings) => {
    setSelectedSettings({
      ...selectedSettings,
      [_roleType]: _value,
    });

    onSelect?.(_value);
  };

  return (
    <div className="w-[320px] p-4">
      <RadioGroup
        className={`w-full ${styles['role-type-radio-group']}`}
        onChange={handleRadioChange}
        type="button"
        value={roleType}
      >
        <Radio
          value={RoleType.Player}
          className="w-[50%]"
          data-testid={concatTestId(testId, 'roleType', 'player')}
        >
          {I18n.t(
            'scene_workflow_chat_node_conversation_visibility_custom_roles',
            {},
            'Player',
          )}
        </Radio>
        <Radio
          value={RoleType.NicknameVariable}
          className="w-[50%]"
          data-testid={concatTestId(testId, 'roleType', 'nickname')}
        >
          {I18n.t(
            'scene_workflow_chat_node_conversation_visibility_custom_variable',
            {},
            'Nickname Variables',
          )}
        </Radio>
      </RadioGroup>
      <div className="h-max-[280px] overflow-auto">
        {roleType === RoleType.Player ? (
          <PlayerCheckboxGroup
            key="player"
            value={selectedSettings[RoleType.Player]}
            onChange={handleSelect(RoleType.Player)}
          />
        ) : (
          // <div>123</div>
          <NicknameVariableCheckboxGroup
            value={selectedSettings[RoleType.NicknameVariable]}
            key="nickname"
            onChange={handleSelect(RoleType.NicknameVariable)}
          />
        )}
      </div>
    </div>
  );
};
