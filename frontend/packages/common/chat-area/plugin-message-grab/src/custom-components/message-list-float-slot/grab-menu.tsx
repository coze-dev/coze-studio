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
  // 获取插件实例
  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  // 获取插件的业务上下文信息
  const { pluginBizContext } = plugin;
  const { eventCenter, storeSet } = pluginBizContext;
  const { usePreferenceStore, useSelectionStore } = storeSet;

  // 事件中心监听函数
  const { on, off } = eventCenter;

  /**
   * Float Menu 的 Ref
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
   * 是否启用 Grab 插件
   */
  const enableGrab = usePreferenceStore(state => state.enableGrab);

  /**
   * 处理位置信息的回调
   */
  const handlePositionChange = (_position: GrabPosition | null) => {
    // 更新浮动菜单在 Store 中的数据
    updateFloatMenuPosition(_position);

    // 清空栈后调用刷新的逻辑 （因为 floatMenu 在 hidden 状态下 通过 ref 拿到的 rect 信息是空，所以需要延迟一会儿获取）
    defer(() => floatMenuRef.current?.refreshOpacity());
  };

  /**
   * 处理选区的变化
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
     * 过滤特殊类型的消息
     * 目前只有通过消息来源进行判断 messageSource
     * 1. 通知类型 （禁止选择）
     */
    if (
      selectionData &&
      FILTER_MESSAGE_SOURCE.includes(selectionData.messageSource)
    ) {
      return;
    }

    // 更新选区数据
    updateSelectionData(selectionData);

    // 更新展示浮动菜单的状态
    updateIsFloatMenuVisible(!!selectionData);

    // 拿取 MessageId
    const messageId = selectionData?.ancestorAttributeValue;

    // 判断是否是特殊消息
    const isSpecialMessage = messageId === NO_MESSAGE_ID_MARK;

    // 如果拿不到消息 ID，就证明选区不在消息哪
    if (!messageId) {
      return;
    }

    // 特殊处理，需要判断是否是回复中的消息
    const { is_finish } =
      plugin.chatAreaPluginContext.readonlyAPI.message.findMessage(messageId) ??
      {};

    // 如果消息回复没完成 并且 不是一个特殊的消息 那么就不展示，否则展示
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

  // 如果没有开启 Grab 插件，那么就隐藏了当然
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
