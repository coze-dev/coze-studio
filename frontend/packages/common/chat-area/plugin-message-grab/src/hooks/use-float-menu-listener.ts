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

import { useEffect, useRef, useState } from 'react';

import { defer, delay } from 'lodash-es';
import {
  CONTENT_ATTRIBUTE_NAME,
  getAncestorAttributeNode,
  type GrabPosition,
} from '@coze-common/text-grab';
import { NO_MESSAGE_ID_MARK } from '@coze-common/chat-uikit';
import { useEventCallback } from '@coze-common/chat-hooks';
import {
  type OnLinkElementContext,
  type useWriteablePlugin,
} from '@coze-common/chat-area';

import { getMouseNearbyRect } from '../utils/get-mouse-nearby-rect';
import {
  EventNames,
  type GrabPluginBizContext,
} from '../types/plugin-biz-context';
import { type MenuListRef } from '../custom-components/menu-list';

const DELAY_DISAPPEAR_TIME = 100;
const TIMEOUT = 100;
// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function
export const useFloatMenuListener = ({
  plugin,
}: {
  plugin: ReturnType<typeof useWriteablePlugin<GrabPluginBizContext>>;
}) => {
  const floatMenuRef = useRef<MenuListRef>(null);

  const [visible, setVisible] = useState(false);

  const targetElement = useRef<HTMLElement | null>(null);
  const targetInfo = useRef<{
    source: string;
    type: 'image' | 'link';
    text: string;
  } | null>(null);

  /**
   * In Scrolling
   */
  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * Scrolling timer
   */
  const scrollingTimer = useRef<NodeJS.Timeout | null>(null);

  const { pluginBizContext } = plugin;
  const { eventCenter } = pluginBizContext;
  const { on, off } = eventCenter;

  const isMouseInMenu = useRef(false);
  const [position, setPosition] = useState<GrabPosition | null>(null);
  const timer = useRef<number | null>(null);

  const mouseInfo = useRef<GrabPosition>({ x: 0, y: 0 });

  const handleMenuMouseEnter = useEventCallback(() => {
    isMouseInMenu.current = true;
    if (timer.current) {
      clearTimeout(timer.current);
    }
  });

  const handleMenuMouseLeave = useEventCallback(() => {
    isMouseInMenu.current = false;
    handleCardLinkElementMouseLeave();
  });

  const isMessageFinished = () => {
    const target = getAncestorAttributeNode(
      targetElement.current,
      CONTENT_ATTRIBUTE_NAME,
    );

    const messageId = target?.attributes.getNamedItem(
      CONTENT_ATTRIBUTE_NAME,
    )?.value;

    const isSpecialMessage = messageId === NO_MESSAGE_ID_MARK;

    if (isSpecialMessage) {
      return true;
    }

    if (!messageId) {
      return false;
    }

    const { is_finish } =
      plugin.chatAreaPluginContext.readonlyAPI.message.findMessage(messageId) ??
      {};

    return is_finish;
  };

  const handleCardLinkElementMouseEnter = useEventCallback(
    (ctx: OnLinkElementContext & { type: 'link' | 'image' }) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      targetElement.current = ctx.element;
      targetInfo.current = {
        source: ctx.link,
        type: ctx.type,
        text: ctx.element.textContent ?? '',
      };

      const isFinished = isMessageFinished();

      if (!isFinished) {
        return;
      }

      setVisible(true);
      handleViewScroll();

      defer(() => {
        floatMenuRef.current?.refreshOpacity();
      });
    },
  );

  const handleCardLinkElementMouseLeave = useEventCallback(() => {
    timer.current = delay(() => {
      if (isMouseInMenu.current) {
        return;
      }
      targetElement.current = null;
      setVisible(false);
    }, DELAY_DISAPPEAR_TIME);
  });

  const handleViewScroll = useEventCallback(() => {
    const menuRef = floatMenuRef.current?.getRef();

    if (
      !targetElement.current ||
      !menuRef ||
      !menuRef.current ||
      !targetInfo.current
    ) {
      return;
    }

    const target = targetElement.current;
    const targetRect = target.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    let x = 0;
    let y = 0;
    if (targetInfo.current.type === 'image') {
      x = targetRect.right;
      y = targetRect.bottom - targetRect.height / 2 - menuRect.height / 2;
    } else {
      const targetRects = target.getClientRects();

      const nearbyRect =
        getMouseNearbyRect(Array.from(targetRects), mouseInfo.current) ??
        targetRect;

      x = mouseInfo.current.x;
      y = nearbyRect.bottom;
    }

    setPosition({ x, y });
  });

  const handleMouseMove = useEventCallback((event: MouseEvent) => {
    const [x, y] = [event.clientX, event.clientY];
    mouseInfo.current = { x, y };
  });

  const handleSmartScreenChange = useEventCallback(() => {
    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }

    setIsScrolling(true);
    scrollingTimer.current = setTimeout(() => {
      handleViewScroll();
      setIsScrolling(false);
    }, TIMEOUT);
  });

  useEffect(() => {
    on(EventNames.OnLinkElementMouseEnter, handleCardLinkElementMouseEnter);
    on(EventNames.OnLinkElementMouseLeave, handleCardLinkElementMouseLeave);
    on(EventNames.OnViewScroll, handleSmartScreenChange);
    on(EventNames.OnMessageUpdate, handleSmartScreenChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleSmartScreenChange);
    window.addEventListener('wheel', handleSmartScreenChange);
    window.addEventListener('scroll', handleSmartScreenChange);

    return () => {
      off(EventNames.OnLinkElementMouseEnter, handleCardLinkElementMouseEnter);
      off(EventNames.OnLinkElementMouseLeave, handleCardLinkElementMouseLeave);
      off(EventNames.OnViewScroll, handleSmartScreenChange);
      off(EventNames.OnMessageUpdate, handleSmartScreenChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleSmartScreenChange);
      window.removeEventListener('wheel', handleSmartScreenChange);
      window.removeEventListener('scroll', handleSmartScreenChange);
    };
  }, []);

  return {
    handleMenuMouseEnter,
    handleMenuMouseLeave,
    targetElement,
    targetInfo,
    position,
    floatMenuRef,
    visible,
    setVisible,
    computePosition: handleSmartScreenChange,
    isScrolling,
  };
};
