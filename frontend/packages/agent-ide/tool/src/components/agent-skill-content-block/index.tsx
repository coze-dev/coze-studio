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
        // Only when the dom change auto-unfold function is turned on
        const callback: MutationCallback = mutationList => {
          if (mutationList.length > 0 && !isOpen) {
            // When the dom changes and is not turned on, it will automatically turn on
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
            // @Danger cannot prevent the click bubbling of internal nodes, otherwise the selected state of the node cannot be set
            const el = e.target as HTMLElement;
            // Multiple judgments are required here,
            // The first judgment: If it is contained in the container, you need to switch open.
            // Second judgment: If it is included in the action, it cannot switch open, everything else is OK
            // The @TIP contains method will determine its own node, that is, A.contains (A) is also true. But even itself has no effect here
            if (containerRef.current && containerRef.current.contains(el)) {
              if (actionDivRef.current && actionDivRef.current.contains(el)) {
                // Do not switch open at this time
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
