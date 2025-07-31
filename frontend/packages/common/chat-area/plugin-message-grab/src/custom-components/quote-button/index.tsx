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
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozQuotation } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { getMessage } from '../../utils/get-message';
import { type GrabPluginBizContext } from '../../types/plugin-biz-context';

export interface QuoteButtonProps {
  onClose?: () => void;
  onClick?: () => void;
}

export const QuoteButton: FC<QuoteButtonProps> = ({ onClose, onClick }) => {
  const { pluginBizContext, chatAreaPluginContext } =
    useWriteablePlugin<GrabPluginBizContext>(PluginName.MessageGrab);

  const { onQuote } = pluginBizContext.eventCallbacks;

  const { useQuoteStore, useSelectionStore, usePreferenceStore } =
    pluginBizContext.storeSet;

  const { updateQuoteContent, updateQuoteVisible } = useQuoteStore(
    useShallow(state => ({
      updateQuoteVisible: state.updateQuoteVisible,
      updateQuoteContent: state.updateQuoteContent,
    })),
  );

  const enableGrab = usePreferenceStore(state => state.enableGrab);

  const { useDeleteFile } = chatAreaPluginContext.writeableHook.file;
  const { getFileStoreInstantValues } =
    chatAreaPluginContext.readonlyAPI.batchFile;

  const deleteFile = useDeleteFile();

  const deleteAllFile = () => {
    const { fileIdList } = getFileStoreInstantValues();

    fileIdList.forEach(id => deleteFile(id));
  };

  const getMessageInfo = () => {
    const { selectionData } = useSelectionStore.getState();

    const messageId = selectionData?.ancestorAttributeValue;

    if (!messageId) {
      return;
    }

    return getMessage({ messageId, chatAreaPluginContext });
  };

  const handleClick = () => {
    deleteAllFile();

    if (onClick) {
      onClick();
      onClose?.();
      return;
    }

    const { normalizeSelectionNodeList } = useSelectionStore.getState();

    updateQuoteContent(normalizeSelectionNodeList);

    updateQuoteVisible(true);

    const message = getMessageInfo();

    onQuote?.({ botId: message?.sender_id ?? '', source: message?.source });

    onClose?.();
  };

  if (!enableGrab) {
    return null;
  }

  return (
    <Tooltip content={I18n.t('quote_ask_in_chat')} clickToHide={true}>
      <IconButton
        icon={<IconCozQuotation className="text-lg coz-fg-secondary" />}
        color="secondary"
        onClick={handleClick}
        size="small"
        wrapperClass="flex justify-center items-center"
      />
    </Tooltip>
  );
};
