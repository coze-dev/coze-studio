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

import React, { type Attributes } from 'react';

import { BotE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { TabPane, Tabs, useUIModal } from '@coze-arch/bot-semi';

import {
  type MemoryModule,
  type MemoryDebugDropdownMenuItem,
} from '../../types';
import { useSendTeaEventForMemoryDebug } from '../../hooks/use-send-tea-event-for-memory-debug';

import styles from './index.module.less';

export interface MemoryDebugModalProps {
  memoryModule: MemoryModule | undefined;
  menuList: MemoryDebugDropdownMenuItem[];
  isStore: boolean;
  setMemoryModule: (type: MemoryModule) => void;
}

export const useMemoryDebugModal = ({
  memoryModule,
  menuList,
  setMemoryModule,
  isStore,
}: MemoryDebugModalProps) => {
  const sendTeaEventForMemoryDebug = useSendTeaEventForMemoryDebug({ isStore });

  const defaultModule = menuList[0]?.name;

  const curMemoryModule = memoryModule || defaultModule;

  const { modal, open, close } = useUIModal({
    type: 'info',
    width: 1138,
    height: 665,
    className: styles['memory-debug-modal'],
    bodyStyle: {
      padding: 0,
    },
    title: I18n.t('database_memory_menu'),
    centered: true,
    footer: null,
    onCancel: () => {
      sendTeaEventForMemoryDebug(curMemoryModule, { action: 'turn_off' });
      setMemoryModule(defaultModule);
      close();
    },
  });

  const onChange = (key: MemoryModule) => {
    setMemoryModule(key);
    sendTeaEventForMemoryDebug(key);
  };

  return {
    node: modal(
      <Tabs
        className={styles.tabs_memory}
        tabPosition="left"
        activeKey={curMemoryModule}
        onChange={onChange as (k: string) => void}
        lazyRender
      >
        {menuList.map(item => (
          <TabPane
            itemKey={item.name}
            key={item.name}
            tab={
              <span
                data-dtestid={`${BotE2e.BotMemoryDebugModalTab}.${item.name}`}
                className={styles['memory-debug-modal-tabs-tab']}
              >
                {item.icon}
                {item.label}
              </span>
            }
          >
            {/* Pass the onCancel parameter to children to close the pop-up window from within */}
            {React.isValidElement(item.component)
              ? React.cloneElement(item.component, {
                  onCancel: close,
                } as unknown as Attributes)
              : item.component}
          </TabPane>
        ))}
      </Tabs>,
    ),
    open,
    close,
  };
};
