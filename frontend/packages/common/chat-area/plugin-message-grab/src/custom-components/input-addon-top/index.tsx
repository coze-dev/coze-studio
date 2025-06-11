import { useEffect, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';
import { IconCozCross, IconCozQuotation } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import { QuoteNode } from '../quote-node';
import { type GrabPluginBizContext } from '../../types/plugin-biz-context';

type IProps = Record<string, unknown>;

export const QuoteInputAddonTop: FC<IProps> = () => {
  const { pluginBizContext, chatAreaPluginContext } =
    useWriteablePlugin<GrabPluginBizContext>(PluginName.MessageGrab);

  const { useChatInputLayout } = chatAreaPluginContext.readonlyHook.input;

  const { useQuoteStore } = pluginBizContext.storeSet;

  const { quoteVisible, quoteContent, updateQuoteVisible, updateQuoteContent } =
    useQuoteStore(
      useShallow(state => ({
        quoteVisible: state.quoteVisible,
        quoteContent: state.quoteContent,
        updateQuoteVisible: state.updateQuoteVisible,
        updateQuoteContent: state.updateQuoteContent,
      })),
    );

  const handleClose = () => {
    updateQuoteContent(null);
    updateQuoteVisible(false);
  };

  const { layoutContainerRef } = useChatInputLayout();

  useEffect(() => {
    if (!layoutContainerRef?.current) {
      return;
    }

    const handleStopPropagation = (e: PointerEvent) => e.stopPropagation();

    layoutContainerRef.current.addEventListener(
      'pointerup',
      handleStopPropagation,
    );

    return () => {
      layoutContainerRef.current?.removeEventListener(
        'pointerup',
        handleStopPropagation,
      );
    };
  }, [layoutContainerRef?.current]);

  if (!quoteContent || !quoteVisible) {
    return null;
  }

  return (
    <div className="w-full h-[32px] flex items-center px-[16px] coz-mg-primary">
      <IconCozQuotation className="coz-fg-secondary mr-[8px] w-[12px] h-[12px]" />
      <div className="flex flex-row items-center flex-1">
        <div className="coz-fg-secondary flex-1 min-w-0 w-0 truncate text-[12px] leading-[16px]">
          <QuoteNode nodeList={quoteContent} theme="black" />
        </div>
        <IconButton
          icon={<IconCozCross className="w-[14px] h-[14px]" />}
          onClick={handleClose}
          color="secondary"
          size="small"
          className="!rounded-[4px]"
          wrapperClass="flex item-center justify-center"
        />
      </div>
    </div>
  );
};
