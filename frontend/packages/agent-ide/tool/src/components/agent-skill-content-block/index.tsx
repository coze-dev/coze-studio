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
  type CSSProperties,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';
import { Tooltip, Collapsible } from '@coze-arch/bot-semi';
import { IconInfo, IconArrowRight } from '@coze-arch/bot-icons';

import s from './index.module.less';

export type AgentContentBlockProps = PropsWithChildren<{
  allowToggleCollapsible?: boolean;
  title?: ReactNode;
  actionButton?: ReactNode;
  tooltip?: string | ReactNode;
  maxContentHeight?: number;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  defaultExpand?: boolean;
  autoExpandWhenDomChange?: boolean;
}>;

export interface ContentRef {
  setOpen?: (isOpen: boolean) => void;
}

export const AgentSkillContentBlock = forwardRef<
  ContentRef,
  AgentContentBlockProps
>(
  (
    {
      allowToggleCollapsible = true,
      children,
      title,
      actionButton,
      maxContentHeight,
      tooltip,
      className,
      contentClassName,
      style,
      defaultExpand = true,
      autoExpandWhenDomChange,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(defaultExpand);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const childNodeRef = useRef<HTMLDivElement>(null);
    const actionDivRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const target = childNodeRef.current;
      if (autoExpandWhenDomChange && target && allowToggleCollapsible) {
        const config = { attributes: true, childList: true, subtree: true };
        // 只有开启了dom改变自动展开功能才启动
        const callback: MutationCallback = mutationList => {
          if (mutationList.length > 0 && !isOpen) {
            // 当dom改变并且没有开启时，会自动开启
            setIsOpen(!isOpen);
          }
        };
        const observer = new MutationObserver(callback);
        observer.observe(target, config);

        return () => {
          observer.disconnect();
        };
      }
    }, [isOpen, allowToggleCollapsible]);

    useImperativeHandle(ref, () => ({
      setOpen,
    }));

    const setOpen = (innerIsOpen: boolean) => {
      setIsOpen(innerIsOpen);
    };

    return (
      <div
        className={classNames(className, s['content-block'])}
        style={style}
        ref={containerRef}
      >
        <header
          className={classNames(s['header-content'])}
          onClick={e => {
            if (!allowToggleCollapsible) {
              return;
            }
            // @danger 不可以阻止内部节点的点击冒泡，不然无法设置节点的选中态
            const el = e.target as HTMLElement;
            // 这里需要多重判断，
            // 第一次判断：如果包含在container内，才需要去切换open
            // 第二次判断：如果包含在action内，则不能切换open，其他都可以
            // @TIP contains方法会判断自身节点，即A.contains(A)也是true。但是这里就算是自身也没有影响
            if (containerRef.current && containerRef.current.contains(el)) {
              if (actionDivRef.current && actionDivRef.current.contains(el)) {
                // 此时不切换open
                return;
              }
              setIsOpen(!isOpen);
            }
          }}
        >
          <div className={s.header}>
            {allowToggleCollapsible ? (
              <div
                className={classNames({
                  [s['header-icon-arrow'] || '']: true,
                  [s.open || '']: isOpen,
                })}
              >
                <IconArrowRight />
              </div>
            ) : null}
            <div className={s.label}>{title}</div>
            {tooltip ? (
              <Tooltip
                showArrow
                position="top"
                className={s.popover}
                content={tooltip}
              >
                <IconInfo className={s.icon} />
              </Tooltip>
            ) : null}
          </div>
          <div ref={actionDivRef}>{actionButton}</div>
        </header>
        <div
          className={classNames({
            [s['overflow-content'] || '']: true,
            [contentClassName || '']: Boolean(contentClassName),
            [s.open || '']: isOpen,
          })}
        >
          <Collapsible keepDOM fade isOpen={isOpen}>
            <div
              className={s.content}
              ref={childNodeRef}
              style={{
                maxHeight: maxContentHeight ? maxContentHeight : undefined,
              }}
            >
              {children}
            </div>
          </Collapsible>
        </div>
      </div>
    );
  },
);
