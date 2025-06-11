import { type FC } from 'react';

import { NavModalItem } from '@coze-agent-ide/space-bot/component';
import { I18n } from '@coze-arch/i18n';
import { IconCozUserPermission } from '@coze/coze-design/icons';

export const enum SkillsNavItem {
  Trigger = 'Trigger',
  Async = 'Async',
  Permission = 'Permission',
}

export const SkillsNav: FC<{
  onSwitch: (skill: SkillsNavItem) => void;
  selectedItem: SkillsNavItem;
}> = ({ onSwitch, selectedItem }) => (
  <NavModalItem
    selectedIcon={<IconCozUserPermission />}
    unselectedIcon={<IconCozUserPermission />}
    selected={selectedItem === SkillsNavItem.Permission}
    text={I18n.t('permission_manage_modal_tab_name')}
    onClick={() => onSwitch(SkillsNavItem.Permission)}
  />
);

SkillsNav.displayName = 'SkillsNav';
