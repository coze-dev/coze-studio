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
import { IconCozUserPermission } from '@coze-arch/coze-design/icons';
import { NavModalItem } from '@coze-agent-ide/space-bot/component';

export const enum SkillsNavItem {
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
