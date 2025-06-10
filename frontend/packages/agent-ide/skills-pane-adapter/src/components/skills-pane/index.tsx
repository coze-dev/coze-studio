import { type ReactNode, useState } from 'react';

import {
  NavModal,
  PluginPermissionManageList,
  PermissionManageTitle,
} from '@coze-agent-ide/space-bot/component';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozSkill,
  IconCozUserPermission,
} from '@coze/coze-design/icons';
import { MenuItem, MenuSubMenu } from '@coze/coze-design';
import { OperateTypeEnum, ToolPane } from '@coze-agent-ide/debug-tool-list';

import { SkillsNav, SkillsNavItem } from './components/skills-nav';

export const SkillsPane: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [navItem, setNavItem] = useState(SkillsNavItem.Trigger);
  const botId = useBotInfoStore(store => store.botId);

  const getMainContent = () => {
    if (!showModal) {
      return null;
    }
    switch (navItem) {
      case SkillsNavItem.Permission:
        return (
          <PluginPermissionManageList botId={botId} confirmType="popconfirm" />
        );
      default:
        return null;
    }
  };

  const getMainContentTitle = () => {
    if (!showModal) {
      return null;
    }
    switch (navItem) {
      case SkillsNavItem.Permission:
        return <PermissionManageTitle />;
      default:
        return null;
    }
  };

  const { menusNode } = getMenus(nav => {
    setNavItem(nav);
    setShowModal(true);
  });

  return (
    <>
      <NavModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        title={I18n.t('debug_skills')}
        navigation={<SkillsNav onSwitch={setNavItem} selectedItem={navItem} />}
        mainContent={getMainContent()}
        mainContentTitle={getMainContentTitle()}
        width={1000}
        bodyStyle={{
          padding: 0,
        }}
      />
      <ToolPane
        itemKey={`key_${I18n.t('bot_preview_task')}`}
        title={I18n.t('debug_skills')}
        operateType={OperateTypeEnum.DROPDOWN}
        onEntryButtonClick={() => {
          setNavItem(SkillsNavItem.Trigger);
          setShowModal(true);
        }}
        dropdownProps={{
          render: <MenuSubMenu mode="menu">{menusNode}</MenuSubMenu>,
          showTick: true,
          clickToHide: true,
          zIndex: 1000,
        }}
        icon={<IconCozSkill />}
      />
    </>
  );
};

const getMenus = (onSwitchNavItem: (navItem: SkillsNavItem) => void) => {
  const menus: { icon: ReactNode; title: string; navItem: SkillsNavItem }[] = [
    {
      icon: <IconCozUserPermission />,
      title: I18n.t('permission_manage_modal_tab_name'),
      navItem: SkillsNavItem.Permission,
    },
  ];

  return {
    menusCount: menus.length,
    menusNode: (
      <>
        {menus.map(menu => (
          <MenuItem
            icon={menu.icon}
            onClick={() => onSwitchNavItem(menu.navItem)}
          >
            {menu.title}
          </MenuItem>
        ))}
      </>
    ),
  };
};
