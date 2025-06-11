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
