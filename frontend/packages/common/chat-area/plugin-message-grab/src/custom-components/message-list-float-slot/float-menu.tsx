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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { defer } from 'lodash-es';
import classNames from 'classnames';
import { isTouchDevice } from '@coze-common/text-grab';
import {
  CONTENT_ATTRIBUTE_NAME,
  GrabElementType,
  type GrabNode,
} from '@coze-common/text-grab';
import {
  PluginName,
  useWriteablePlugin,
  type MessageListFloatSlot,
} from '@coze-common/chat-area';

import { QuoteButton } from '../quote-button';
import { MenuList } from '../menu-list';
import { getMessage } from '../../utils/get-message';
import {
  EventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';
import { useHideQuote } from '../../hooks/use-hide-quote';
import { useFloatMenuListener } from '../../hooks/use-float-menu-listener';
import { useAutoGetMaxPosition } from '../../hooks/use-auto-get-max-position';

export const FloatMenu: MessageListFloatSlot = () => {
  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );
  const { chatAreaPluginContext, pluginBizContext } = plugin;
  const { eventCenter } = pluginBizContext;
  const { usePreferenceStore } = pluginBizContext.storeSet;
  const enableGrab = usePreferenceStore(state => state.enableGrab);

  const { on, off } = eventCenter;

  const { useQuoteStore } = pluginBizContext.storeSet;
  const { updateQuoteContent, updateQuoteVisible } = useQuoteStore(
    useShallow(state => ({
      updateQuoteVisible: state.updateQuoteVisible,
      updateQuoteContent: state.updateQuoteContent,
    })),
  );

  const {
    handleMenuMouseEnter,
    handleMenuMouseLeave,
    targetElement,
    targetInfo,
    position,
    floatMenuRef,
    visible,
    setVisible,
    computePosition,
    isScrolling,
  } = useFloatMenuListener({
    plugin,
  });

  const { targetRef: messageRef, forceHidden } = useHideQuote<HTMLElement>({
    containerRef: targetElement,
  });

  const { maxPositionX } = useAutoGetMaxPosition({
    messageRef,
    position,
    floatMenuRef,
  });

  const isGrabMenuVisible = plugin.pluginBizContext.storeSet.useSelectionStore(
    state => state.isFloatMenuVisible && !!state.floatMenuPosition,
  );

  const handleQuoteClick = () => {
    const { source = '', type = 'link', text = '' } = targetInfo.current ?? {};
    const target = messageRef.current;
    const messageId = target?.attributes.getNamedItem(
      CONTENT_ATTRIBUTE_NAME,
    )?.value;

    if (!messageId) {
      return;
    }

    const message = getMessage({
      messageId,
      chatAreaPluginContext,
    });

    const node: GrabNode =
      type === 'image'
        ? {
            type: GrabElementType.IMAGE,
            src: source,
            children: [
              {
                text: source,
              },
            ],
          }
        : {
            type: GrabElementType.LINK,
            url: source,
            children: [
              {
                text,
              },
            ],
          };

    updateQuoteContent([node]);
    updateQuoteVisible(true);
    pluginBizContext.eventCallbacks.onQuote?.({
      botId: message?.sender_id ?? '',
      source: message?.source,
    });
  };

  useEffect(() => {
    on(EventNames.OnMessageUpdate, computePosition);
    on(EventNames.OnViewScroll, computePosition);

    return () => {
      off(EventNames.OnMessageUpdate, computePosition);
      off(EventNames.OnViewScroll, computePosition);
    };
  }, []);

  if (!enableGrab || isTouchDevice()) {
    return null;
  }

  const top = position?.y;
  const left =
    (position?.x ?? 0) > (maxPositionX ?? 0) ? maxPositionX : position?.x;

  return (
    <>
      {
        <MenuList
          ref={floatMenuRef}
          className={classNames({
            hidden: !visible || forceHidden || isGrabMenuVisible || isScrolling,
          })}
          style={{
            top,
            left,
          }}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <QuoteButton
            onClick={handleQuoteClick}
            onClose={() => {
              defer(() => setVisible(false));
            }}
          />
        </MenuList>
      }
    </>
  );
};
