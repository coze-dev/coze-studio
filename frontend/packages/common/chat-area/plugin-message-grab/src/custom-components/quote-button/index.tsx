import { type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozQuotation } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

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
