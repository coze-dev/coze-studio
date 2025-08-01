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

// Quick instructions in the IDE configuration tool
import React, { type FC, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useDebounceFn } from 'ahooks';
import {
  type ShortCutStruct,
  getStrictShortcuts,
  type ShortCutCommand,
  ToolKey,
} from '@coze-agent-ide/tool-config';
import type { IToggleContentBlockEventParams } from '@coze-agent-ide/tool';
import {
  AddButton,
  EventCenterEventName,
  ToolContentBlock,
  useEvent,
  useToolContentBlockDefaultExpand,
  useToolDispatch,
  useToolValidData,
} from '@coze-agent-ide/tool';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  getBotDetailIsReadonly,
  updateShortcutSort,
} from '@coze-studio/bot-detail-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { Toast } from '@coze-arch/bot-semi';
import { BotMode } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { type SkillsModalProps } from '../types';
import { useShortcutEditModal } from '../shortcut-edit';
import { isApiError } from '../../utils/handle-error';
import { EmptyShortcuts } from './shortcut-list/empty-shortcuts';
import { ShortcutList } from './shortcut-list';
import { ShortcutTips } from './config-action';

import style from './index.module.less';

const MAX_SHORTCUTS = 10;

export interface ShortcutToolConfigProps {
  title: string;
  toolKey: 'shortcut';
  skillModal: FC<SkillsModalProps>;
  botMode: BotMode;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const ShortcutToolConfig: FC<ShortcutToolConfigProps> = props => {
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const { title, skillModal: SkillModal, botMode } = props;
  const { isReadonly, botId } = useBotInfoStore(
    useShallow(state => ({
      isReadonly: getBotDetailIsReadonly(),
      botId: state.botId,
    })),
  );
  const { shortcuts: initShortcuts = [] } = useBotSkillStore(
    useShallow(state => ({
      shortcuts: state.shortcut.shortcut_list,
    })),
  );

  const getSpaceId = useSpaceStore(state => state.getSpaceId);
  const setHasValidData = useToolValidData();

  // Single command that does not show the specified agent
  const singleShortcuts = initShortcuts?.filter(shortcut => !shortcut.agent_id);
  const shortcuts =
    botMode === BotMode.SingleMode ? singleShortcuts : initShortcuts;

  const hasConfiguredShortcuts = Boolean(shortcuts && shortcuts.length > 0);
  setHasValidData(hasConfiguredShortcuts);

  const isReachLimit = shortcuts.length >= MAX_SHORTCUTS;

  const defaultExpand = useToolContentBlockDefaultExpand({
    configured: hasConfiguredShortcuts,
  });

  const dispatch = useToolDispatch<ShortCutStruct>();
  const { emit } = useEvent();

  const [selectedShortcut, setSelectedShortcut] = useState<
    ShortCutCommand | undefined
  >(undefined);

  const { run: updateShortcutSortDebounce } = useDebounceFn(
    async (newShortcuts: string[]) => {
      await updateShortcutSort(newShortcuts);
    },
    {
      wait: 500,
    },
  );

  const onDisorder = async (orderList: ShortCutCommand[]) => {
    try {
      const newSortList = orderList.map(item => item.command_id);
      dispatch({ shortcut_list: orderList, shortcut_sort: newSortList });
      await updateShortcutSortDebounce(newSortList);
    } catch (e) {
      logger.error({
        error: e as Error,
        eventName: 'shortcut-disorder-service-fail',
      });
    }
  };

  const onEditClick = (shortcut: ShortCutCommand) => {
    setSelectedShortcut(shortcut);
    openShortcutModal();
  };

  const onRemoveClick = async (shortcut: ShortCutCommand) => {
    try {
      const newSorts = shortcuts
        ?.filter(item => item.command_id !== shortcut.command_id)
        .map(item => item.command_id);

      await updateShortcutSort(newSorts);
      const newShortcuts = shortcuts?.filter(
        item => item.command_id !== shortcut.command_id,
      );

      newShortcuts && dispatch({ shortcut_list: newShortcuts });
    } catch (error) {
      if (!isApiError(error)) {
        Toast.error(I18n.t('shortcut_modal_fail_to_delete_shortcut_error'));
      }
      logger.error({
        error: error as Error,
        eventName: 'shortcut-removeShortcut-fail',
      });
    }
  };

  const closeModal = () => {
    closeShortcutModal();
    setApiErrorMessage('');
  };

  const editShortcut = async (
    shortcut: ShortCutCommand,
    onFail: () => void,
  ) => {
    try {
      await PlaygroundApi.CreateUpdateShortcutCommand(
        {
          object_id: botId,
          space_id: getSpaceId(),
          shortcuts: shortcut,
        },
        { __disableErrorToast: true },
      );
      // TODO: hzf has to be added
      // if (res && res.data?.check_not_pass) {
      //   Toast.error(I18n.t('shortcut_modal_illegal_keyword_detected_error'));
      //   onFail();
      //   return;
      // }
      const newShortcuts = shortcuts?.map(item =>
        item.command_id === shortcut.command_id ? shortcut : item,
      );
      newShortcuts && dispatch({ shortcut_list: newShortcuts });
      closeModal();
      onFail();
    } catch (e) {
      onFail();
      if (!isApiError(e)) {
        Toast.error(I18n.t('shortcut_modal_fail_to_update_shortcut_error'));
      }
      if (isApiError(e)) {
        const error = e as { message?: string; msg?: string };
        setApiErrorMessage(error.message || error.msg || '');
      }
      logger.error({
        error: e as Error,
        eventName: 'shortcut-editShortcut-fail',
      });
    }
  };

  const addShortcut = async (shortcut: ShortCutCommand, onFail: () => void) => {
    try {
      const { shortcuts: newShortcut } =
        await PlaygroundApi.CreateUpdateShortcutCommand(
          {
            object_id: botId,
            space_id: getSpaceId(),
            shortcuts: shortcut,
          },
          { __disableErrorToast: true },
        );
      const strictShortcuts = newShortcut && getStrictShortcuts([newShortcut]);
      // Only one shortcut can be added at a time
      const strictShortcut = strictShortcuts?.[0];
      if (!strictShortcut) {
        Toast.error('Please fill in the required fields');
        return;
      }
      const newShortcuts = [
        ...(shortcuts?.map(item => item.command_id) || []),
        strictShortcut.command_id,
      ];
      await updateShortcutSort(newShortcuts);
      dispatch({ shortcut_list: [...(shortcuts || []), ...strictShortcuts] });
      emit<IToggleContentBlockEventParams>(
        EventCenterEventName.ToggleContentBlock,
        {
          abilityKey: ToolKey.SHORTCUT,
          isExpand: true,
        },
      );
      closeModal();
    } catch (error) {
      onFail();
      if (!isApiError(error)) {
        Toast.error(I18n.t('shortcut_modal_fail_to_add_shortcut_error'));
      }
      if (isApiError(error)) {
        const e = error as { message?: string; msg?: string };
        setApiErrorMessage(e.message || e.msg || '');
      }
      logger.error({
        error: error as Error,
        eventName: 'shortcut-addShortcut-fail',
      });
    }
  };

  const {
    node: ShortcutModal,
    open: openShortcutModal,
    close: closeShortcutModal,
  } = useShortcutEditModal({
    skillModal: SkillModal,
    shortcut: selectedShortcut,
    errorMessage: apiErrorMessage,
    setErrorMessage: setApiErrorMessage,
    onAdd: addShortcut,
    onEdit: editShortcut,
    botMode,
  });

  const renderShortcutConfig = () => {
    if (!hasConfiguredShortcuts) {
      return <EmptyShortcuts />;
    }
    return (
      <ShortcutList
        shortcuts={shortcuts}
        isReadonly={isReadonly}
        onDisorder={onDisorder}
        onRemove={onRemoveClick}
        onEdit={onEditClick}
      />
    );
  };
  return (
    <>
      {ShortcutModal}
      <ToolContentBlock
        className={style['shortcut-tool-config']}
        showBottomBorder={!hasConfiguredShortcuts}
        header={title}
        defaultExpand={defaultExpand}
        tooltip={<ShortcutTips />}
        actionButton={
          !isReadonly && (
            <>
              <AddButton
                tooltips={
                  isReachLimit
                    ? I18n.t('bot_ide_shortcut_max_limit', {
                        maxCount: MAX_SHORTCUTS,
                      })
                    : I18n.t('bot_ide_shortcut_add_button')
                }
                onClick={() => {
                  if (isReachLimit) {
                    return;
                  }
                  setSelectedShortcut(undefined);
                  openShortcutModal();
                }}
                enableAutoHidden={true}
                data-testid="bot.editor.tool.shortcut.add-button"
              />
            </>
          )
        }
      >
        {renderShortcutConfig()}
      </ToolContentBlock>
    </>
  );
};
