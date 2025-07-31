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

import { useShallow } from 'zustand/react/shallow';
import {
  TOOL_GROUP_CONFIG,
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  type ToolKey,
} from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { I18n } from '@coze-arch/i18n';
import { Menu, Checkbox } from '@coze-arch/coze-design';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { ToolTooltip } from '../tool-tooltip';
import { useRegisteredToolKeyConfigList } from '../../hooks/builtin/use-register-tool-key';
import { useRegisteredToolGroupList } from '../../hooks/builtin/use-register-tool-group';
import { usePreference } from '../../context/preference-context';

import styles from './index.module.less';

type IProps = Record<string, unknown>;

export const ToolMenuDropdownMenu: FC<IProps> = () => {
  const registeredToolKeyConfigList = useRegisteredToolKeyConfigList();
  const registeredToolGroupList = useRegisteredToolGroupList();
  const { botSkillBlockCollapsible, setBotSkillBlockCollapsibleState } =
    usePageRuntimeStore(
      useShallow(state => ({
        botSkillBlockCollapsible: state.botSkillBlockCollapsibleState,
        setBotSkillBlockCollapsibleState:
          state.setBotSkillBlockCollapsibleState,
      })),
    );

  const { isReadonly } = usePreference();

  if (!registeredToolKeyConfigList.length) {
    return null;
  }

  const toolGroupKeyList = Object.keys(TOOL_GROUP_CONFIG);

  const menuConfig = toolGroupKeyList
    .map(toolGroupKey => ({
      toolGroupKey,
      toolGroupTitle: registeredToolGroupList.find(
        toolGroupConfig => toolGroupConfig.toolGroupKey === toolGroupKey,
      )?.groupTitle,
      toolList: registeredToolKeyConfigList
        .filter(toolConfig => toolConfig.toolGroupKey === toolGroupKey)
        .map(toolConfig => toolConfig),
    }))
    .filter(toolGroup => toolGroup.toolList.length);

  const getToolStatus = (toolKey: ToolKey) =>
    botSkillBlockCollapsible[TOOL_KEY_TO_API_STATUS_KEY_MAP[toolKey]];

  const handleClick = (toolKey: ToolKey, currentStatus?: TabStatus) => {
    if (isReadonly) {
      return;
    }

    setBotSkillBlockCollapsibleState({
      [TOOL_KEY_TO_API_STATUS_KEY_MAP[toolKey]]:
        currentStatus === TabStatus.Hide ? TabStatus.Default : TabStatus.Hide,
    });
  };

  return (
    <div className={styles['tool-menu-dropdown-menu']}>
      <Menu.SubMenu mode="menu">
        {menuConfig.map((toolGroup, groupIdx) => (
          <div key={toolGroup.toolGroupKey}>
            <Menu.Title style={{ paddingLeft: '32px' }}>
              {toolGroup.toolGroupTitle}
            </Menu.Title>
            {toolGroup.toolList.map(tool => {
              const toolStatus = getToolStatus(tool.toolKey);
              return (
                <ToolTooltip
                  content={
                    tool.hasValidData
                      ? I18n.t('modules_menu_guide_warning')
                      : undefined
                  }
                  position="right"
                  key={`tooltips-${tool.toolKey}`}
                >
                  <Menu.Item
                    style={{ display: 'block' }}
                    key={tool.toolKey}
                    disabled={tool.hasValidData}
                    onClick={() => handleClick(tool.toolKey, toolStatus)}
                  >
                    <div className={styles['dropdown-item-container']}>
                      <Checkbox
                        checked={toolStatus !== TabStatus.Hide}
                        disabled={tool.hasValidData}
                      />
                      <span className={styles['dropdown-item-text']}>
                        {tool.toolTitle}
                      </span>
                    </div>
                  </Menu.Item>
                </ToolTooltip>
              );
            })}
            {groupIdx < menuConfig.length - 1 ? <Menu.Divider /> : null}
          </div>
        ))}
      </Menu.SubMenu>
    </div>
  );
};
