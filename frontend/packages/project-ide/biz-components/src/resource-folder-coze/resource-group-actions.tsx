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

import React, { useMemo } from 'react';

import {
  ResourceTypeEnum,
  ShortcutsService,
  useIDEService,
} from '@coze-project-ide/framework';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPlus,
  IconCozFolder,
  IconCozTray,
} from '@coze-arch/coze-design/icons';
import { IconButton, Menu, Tooltip } from '@coze-arch/coze-design';
import { ProjectResourceGroupType } from '@coze-arch/bot-api/plugin_develop';

import {
  type BizGroupTypeWithFolder,
  BizResourceContextMenuBtnType,
  type ResourceFolderCozeProps,
  type ResourceSubType,
} from './type';
import {
  createResourceIconMap,
  createResourceLabelMap,
  DISABLE_FOLDER,
} from './constants';

import styles from './styles.module.less';

const ProjectResourceStringType = {
  [ProjectResourceGroupType.Workflow]: 'workflow',
  [ProjectResourceGroupType.Plugin]: 'plugin',
  [ProjectResourceGroupType.Data]: 'data',
};

interface ResourceGroupActionsProps {
  groupType: ProjectResourceGroupType;
  onActionVisibleChange?: (visible: boolean) => void;
  onCreateResource?: (
    groupType: BizGroupTypeWithFolder,
    subType?: ResourceSubType,
  ) => void;
  onImportResource?: (groupType: ProjectResourceGroupType) => void;
  createResourceConfig: ResourceFolderCozeProps['createResourceConfig'];
}

export const ResourceGroupActions: React.FC<ResourceGroupActionsProps> = ({
  groupType,
  onActionVisibleChange,
  onCreateResource,
  onImportResource,
  createResourceConfig,
}) => {
  const shortcutService = useIDEService<ShortcutsService>(ShortcutsService);
  const keybindingContent = useMemo(() => {
    const keybindings = shortcutService.getShortcutByCommandId(
      BizResourceContextMenuBtnType.CreateResource,
    );
    return keybindings?.map(k => k.join(' ')).join(' / ') || '';
  }, [shortcutService]);

  const createResourceNode = Array.isArray(createResourceConfig) ? (
    createResourceConfig.map(({ icon, label, tooltip, subType }) => {
      const children = (
        <Menu.Item
          data-testid={`project-ide.resource-group.actions.menu-item.${subType}`}
          onClick={(value, event) => {
            event.stopPropagation();
            onCreateResource?.(groupType, subType);
          }}
          icon={icon}
        >
          {label}
        </Menu.Item>
      );
      if (tooltip) {
        return (
          <Tooltip
            trigger="hover"
            position="rightTop"
            key={subType}
            showArrow={false}
            content={tooltip}
            style={{ width: 208, padding: 4, borderRadius: 'var(--coze-8)' }}
          >
            {children}
          </Tooltip>
        );
      }
      return children;
    })
  ) : (
    <Menu.Item
      suffix={<span className={styles.shortcut}>{keybindingContent}</span>}
      onClick={(value, event) => {
        event.stopPropagation();
        onCreateResource?.(groupType);
      }}
      icon={createResourceIconMap[groupType]}
    >
      {createResourceLabelMap[groupType]}
    </Menu.Item>
  );
  const menuWidth = useMemo(() => (IS_OVERSEA ? 260 : 198), []);
  return (
    <Menu
      trigger="hover"
      position="bottomLeft"
      onVisibleChange={visible => onActionVisibleChange?.(visible)}
      render={
        <div onClick={e => e.stopPropagation()}>
          <Menu.SubMenu
            className={'w-[198px]'}
            mode="menu"
            style={{ width: menuWidth }}
          >
            {DISABLE_FOLDER ? null : (
              <Menu.Item
                onClick={(value, event) => {
                  event.stopPropagation();
                  onCreateResource?.(ResourceTypeEnum.Folder);
                }}
                icon={<IconCozFolder />}
              >
                {I18n.t('project_resource_sidebar_create_new_folder')}
              </Menu.Item>
            )}
            {createResourceNode}
            <Menu.Item
              onClick={(value, event) => {
                event.stopPropagation();
                onImportResource?.(groupType);
              }}
              icon={<IconCozTray />}
            >
              {I18n.t('project_resource_sidebar_import_from_library')}
            </Menu.Item>
          </Menu.SubMenu>
        </div>
      }
    >
      <IconButton
        data-testid={`project-${ProjectResourceStringType[groupType]}-add-resource`}
        color="secondary"
        size="small"
        icon={<IconCozPlus className="coz-fg-primary" />}
        onClick={e => e.stopPropagation()}
      />
    </Menu>
  );
};
