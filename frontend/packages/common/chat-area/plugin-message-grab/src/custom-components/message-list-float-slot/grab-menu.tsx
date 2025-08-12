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

import { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { defer } from 'lodash-es';
import classNames from 'classnames';
import { type GrabPosition, type SelectionData } from '@coze-common/text-grab';
import { useGrab } from '@coze-common/text-grab';
import { NO_MESSAGE_ID_MARK } from '@coze-common/chat-uikit';
import {
  PluginName,
  useWriteablePlugin,
  type MessageListFloatSlot,
} from '@coze-common/chat-area';

import { QuoteButton } from '../quote-button';
import { MenuList, type MenuListRef } from '../menu-list';
import {
  EventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';
import { FILTER_MESSAGE_SOURCE } from '../../constants/filter-message';

export const GrabMenu: MessageListFloatSlot = ({ contentRef }) => {
  // Get plugin instance
  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  // Get business context information for the plug-in
  const { pluginBizContext } = plugin;
  const { eventCenter, storeSet } = pluginBizContext;
  const { usePreferenceStore, useSelectionStore } = storeSet;

  // Event Center Listener Function
  const { on, off } = eventCenter;

  /**
   * Floating Menu Ref
   */
  const floatMenuRef = useRef<MenuListRef>(null);

  const { isFloatMenuVisible, position, updateFloatMenuPosition } =
    useSelectionStore(
      useShallow(state => ({
        isFloatMenuVisible: state.isFloatMenuVisible,
        position: state.floatMenuPosition,
        updateFloatMenuPosition: state.updateFloatMenuPosition,
      })),
    );

  /**
   * Whether to enable the Grab plugin
   */
  const enableGrab = usePreferenceStore(state => state.enableGrab);

  /**
   * Callbacks to handle location information
   */
  const handlePositionChange = (_position: GrabPosition | null) => {
    // Update Floating Menu Data in Store
    updateFloatMenuPosition(_position);

    // Call the refresh logic after clearing the stack (because the floatMenu is in the hidden state, the rect information obtained through ref is empty, so it needs to be delayed for a while)
    defer(() => floatMenuRef.current?.refreshOpacity());
  };

  /**
   * Handling changes in constituencies
   */
  const handleSelectChange = (selectionData: SelectionData | null) => {
    const {
      updateHumanizedContentText,
      updateNormalizeSelectionNodeList,
      updateOriginContentText,
      updateSelectionData,
      updateIsFloatMenuVisible,
    } = plugin.pluginBizContext.storeSet.useSelectionStore.getState();

    /**
     * Filtering for special types of messages
     * Currently only judged by the source messageSource
     * 1. Notification type (no selection)
     */
    if (
      selectionData &&
      FILTER_MESSAGE_SOURCE.includes(selectionData.messageSource)
    ) {
      return;
    }

    // Update constituency data
    updateSelectionData(selectionData);

    // Update the status of displaying the floating menu
    updateIsFloatMenuVisible(!!selectionData);

    // Get MessageId
    const messageId = selectionData?.ancestorAttributeValue;

    // Determine whether it is a special message
    const isSpecialMessage = messageId === NO_MESSAGE_ID_MARK;

    // If you can't get the message ID, it proves that the constituency is not in the message.
    if (!messageId) {
      return;
    }

    // Special processing, you need to determine whether it is a message in the reply.
    const { is_finish } =
      plugin.chatAreaPluginContext.readonlyAPI.message.findMessage(messageId) ??
      {};

    // If the message reply is not completed, and it is not a special message, then it will not be displayed, otherwise it will be displayed
    if (!is_finish && !isSpecialMessage) {
      updateIsFloatMenuVisible(false);
      return;
    }

    updateHumanizedContentText(selectionData?.humanizedContentText ?? '');
    updateNormalizeSelectionNodeList(
      selectionData?.normalizeSelectionNodeList ?? [],
    );
    updateOriginContentText(selectionData?.originContentText ?? '');
  };

  const { clearSelection, isScrolling, computePosition } = useGrab({
    contentRef,
    floatMenuRef: floatMenuRef.current?.getRef(),
    onSelectChange: handleSelectChange,
    onPositionChange: handlePositionChange,
  });

  const isShowFloatMenu = !!position && isFloatMenuVisible;

  useEffect(() => {
    on(EventNames.OnMessageUpdate, computePosition);
    on(EventNames.OnViewScroll, computePosition);

    return () => {
      off(EventNames.OnMessageUpdate, computePosition);
      off(EventNames.OnViewScroll, computePosition);
    };
  }, []);

  // If the Grab plugin is not enabled, it will be hidden, of course.
  if (!enableGrab) {
    return null;
  }

  return (
    <MenuList
      ref={floatMenuRef}
      style={{
        top: position?.y,
        left: position?.x,
      }}
      className={classNames({
        hidden: !isShowFloatMenu || isScrolling,
      })}
    >
      <QuoteButton onClose={clearSelection} />
    </MenuList>
  );
};
