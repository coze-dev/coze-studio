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

import { BotE2e } from '@coze-data/e2e';
import { UIDropdownItem, UIDropdownMenu } from '@coze-arch/bot-semi';

import {
  type MemoryModule,
  type MemoryDebugDropdownMenuItem,
} from '../../types';
import { useSendTeaEventForMemoryDebug } from '../../hooks/use-send-tea-event-for-memory-debug';

import styles from './index.module.less';

export interface MemoryDebugDropdownProps {
  menuList: MemoryDebugDropdownMenuItem[];
  onClickItem: (memoryModule: MemoryModule) => void;
  isStore?: boolean;
}

export const MemoryDebugDropdown: FC<MemoryDebugDropdownProps> = props => {
  const { menuList, isStore = false, onClickItem } = props;

  const sendTeaEventForMemoryDebug = useSendTeaEventForMemoryDebug({ isStore });

  const handleClickMenu = (memoryModule: MemoryModule) => {
    sendTeaEventForMemoryDebug(memoryModule);
    onClickItem(memoryModule);
  };

  return (
    <UIDropdownMenu className={styles['memory-debug-dropdown']}>
      {menuList?.map(item => (
        <UIDropdownItem
          data-dtestid={`${BotE2e.BotMemoryDebugDropdownItem}.${item.name}`}
          icon={item.icon}
          onClick={() => handleClickMenu(item.name)}
          className={styles['memory-debug-dropdown-item']}
        >
          {item.label}
        </UIDropdownItem>
      ))}
    </UIDropdownMenu>
  );
};
