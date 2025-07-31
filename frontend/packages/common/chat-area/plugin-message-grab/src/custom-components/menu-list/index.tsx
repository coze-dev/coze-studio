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

import {
  type ReactNode,
  forwardRef,
  type CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
  useState,
} from 'react';

import classNames from 'classnames';
import { useEventCallback } from '@coze-common/chat-hooks';
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';

import {
  EventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';

import s from './index.module.less';

interface MenuListProps {
  style?: CSSProperties;
  children: ReactNode;
  className?: string;
  onScroll?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface MenuListRef {
  getRef: () => MutableRefObject<HTMLDivElement | null>;
  refreshOpacity: () => void;
}

const GRADIENT_RANGE = 100;

export const MenuList = forwardRef<MenuListRef, MenuListProps>((props, ref) => {
  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  const { useGetScrollView } =
    plugin.chatAreaPluginContext.readonlyHook.scrollView;

  const { on, off } = plugin.pluginBizContext.eventCenter;
  const { style, children, onScroll, onMouseEnter, onMouseLeave, className } =
    props;

  const getScrollView = useGetScrollView();

  const menuRef = useRef<HTMLDivElement>(null);

  const [opacity, setOpacity] = useState(1);

  useImperativeHandle(ref, () => ({
    getRef: () => menuRef,
    refreshOpacity,
  }));

  const refreshOpacity = useEventCallback(() => {
    onScroll?.();

    const localRect = menuRef.current?.getBoundingClientRect();

    const { rect: scrollRect } = getScrollView().getOriginScrollInfo();

    if (!scrollRect || !localRect) {
      return;
    }

    if (localRect.y - GRADIENT_RANGE <= scrollRect.top) {
      const _opacity = (localRect.y - scrollRect.top) / GRADIENT_RANGE;
      setOpacity(_opacity < 0 ? 0 : _opacity);
    } else if (localRect.y + GRADIENT_RANGE >= scrollRect.bottom) {
      const _opacity = (scrollRect.bottom - localRect.y) / GRADIENT_RANGE;
      setOpacity(_opacity < 0 ? 0 : _opacity);
    } else {
      setOpacity(1);
    }
  });

  useEffect(() => {
    on(EventNames.OnMessageUpdate, refreshOpacity);
    return () => {
      off(EventNames.OnMessageUpdate, refreshOpacity);
    };
  }, []);

  return (
    <div
      className={classNames(
        'fixed p-[2px] coz-bg-max coz-stroke-primary border-[0.5px] rounded-[8px] overflow-hidden grid grid-flow-col gap-[2px] h-[28px]',
        s['container-box-shadow'],
        className,
      )}
      style={{
        ...style,
        opacity,
      }}
      ref={menuRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
});
