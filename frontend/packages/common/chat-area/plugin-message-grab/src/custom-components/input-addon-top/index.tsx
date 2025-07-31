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

import { useEffect, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';
import { IconCozCross, IconCozQuotation } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

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
