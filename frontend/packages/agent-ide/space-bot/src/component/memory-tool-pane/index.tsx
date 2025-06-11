import { useState, type FC } from 'react';

import { type ReactElement } from 'react-markdown/lib/react-markdown';
import { I18n } from '@coze-arch/i18n';
import { type ButtonProps } from '@coze/coze-design';
import { IconMemoryDownMenu } from '@coze-arch/bot-icons';
import { DataErrorBoundary, DataNamespace } from '@coze-data/reporter';
import { BotE2e } from '@coze-data/e2e';
import {
  MemoryDebugDropdown,
  useMemoryDebugModal,
  type MemoryDebugDropdownMenuItem,
  type MemoryModule,
  useSendTeaEventForMemoryDebug,
} from '@coze-data/database';
import { OperateTypeEnum, ToolPane } from '@coze-agent-ide/debug-tool-list';

export interface MemoryToolPaneProps {
  menuList: MemoryDebugDropdownMenuItem[];
}

export const MemoryToolPane: FC<MemoryToolPaneProps> = ({ menuList }) => {
  const isStore = false;

  const sendTeaEventForMemoryDebug = useSendTeaEventForMemoryDebug({
    isStore,
  });

  const [curMemoryModule, setCurMemoryModule] = useState<MemoryModule>();

  const defaultModule = menuList[0]?.name;

  const { open, node: memoryModal } = useMemoryDebugModal({
    memoryModule: curMemoryModule || defaultModule,
    menuList,
    setMemoryModule: setCurMemoryModule,
    isStore,
  });

  return (
    <DataErrorBoundary namespace={DataNamespace.MEMORY}>
      {memoryModal}
      {
        (
          <ToolPane
            visible={menuList.length > 0}
            itemKey={`key_${I18n.t('database_memory_menu')}`}
            operateType={OperateTypeEnum.DROPDOWN}
            title={I18n.t('database_memory_menu')}
            icon={<IconMemoryDownMenu />}
            onEntryButtonClick={() => {
              sendTeaEventForMemoryDebug(defaultModule);
              setCurMemoryModule(defaultModule);
              open();
            }}
            dropdownProps={{
              showTick: true,
              clickToHide: true,
              render: (
                <MemoryDebugDropdown
                  menuList={menuList}
                  onClickItem={memoryModule => {
                    setCurMemoryModule(memoryModule);
                    open();
                  }}
                />
              ),
            }}
            buttonProps={
              {
                'data-testid': BotE2e.BotMemoryDebugBtn,
              } as unknown as ButtonProps
            }
          />
        ) as ReactElement
      }
    </DataErrorBoundary>
  );
};
