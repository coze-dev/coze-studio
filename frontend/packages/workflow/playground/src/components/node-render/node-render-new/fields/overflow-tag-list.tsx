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

import React, {
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import classnames from 'classnames';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';
import { Dropdown } from '@coze-arch/bot-semi';

import s from './overflow-tag-list.module.less';

export interface TagProps {
  key?: string;
  icon?: ReactNode;
  label?: ReactNode;
  tooltip?: ReactNode;
}

export interface OverflowTagListProps<T extends TagProps = TagProps> {
  /* tag list */
  value?: T[];
  enableTooltip?: boolean;
  tagItemRenderer?: (tagData: T) => ReactNode;
  dropdownClassName?: string;
  disableMore?: boolean;
}

const TAG_ITEM_IDENTIFIER_CLASS = 'tag-item-wrapper';

const defaultTagItemRenderer = (tag: TagProps): ReactNode => {
  const { icon, label = '' } = tag;
  return (
    <div className={classnames(s.tagItem, s.limitWidth, 'gap-[4px]')}>
      {icon ? (
        <span className={classnames(s.tagItemIcon, 'text-lg', 'coz-fg-dim')}>
          {icon}
        </span>
      ) : null}
      <span className={s.tagItemLabel}>{label}</span>
    </div>
  );
};

export function OverflowTagList<T extends TagProps = TagProps>({
  value = [],
  enableTooltip,
  tagItemRenderer,
  dropdownClassName,
  disableMore,
}: OverflowTagListProps<T>) {
  const renderTags = (tags: T[]) =>
    tags.map(tag => {
      const { tooltip, key } = tag;
      const tagItemContent =
        tagItemRenderer?.(tag) || defaultTagItemRenderer(tag);
      const tagItem = (
        <div
          key={key}
          className={classnames(TAG_ITEM_IDENTIFIER_CLASS, 'max-w-full')}
        >
          {tagItemContent}
        </div>
      );
      if (!tooltip || !enableTooltip) {
        return tagItem;
      }
      return (
        <Tooltip
          key={key ? `tooltip-${key}` : undefined}
          content={<span className="coz-fg-primary text-lg">{tooltip}</span>}
          style={{ backgroundColor: 'rgba(var(--coze-bg-3), 1)' }}
        >
          {tagItem}
        </Tooltip>
      );
    });

  const tagListRef = useRef<HTMLDivElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useLayoutEffect(() => {
    if (!tagListRef.current) {
      return;
    }
    const listWidth = tagListRef.current?.clientWidth ?? 0;
    const tags = Array.from(
      tagListRef.current.getElementsByClassName(TAG_ITEM_IDENTIFIER_CLASS),
    ) as HTMLElement[];
    if (!tags?.length) {
      setShowOverlay(false);
    } else {
      const lastTag = tags[tags.length - 1];
      const right = lastTag.offsetWidth + lastTag.offsetLeft;
      setShowOverlay(right > listWidth);
    }
  }, [value]);

  return (
    <div
      ref={tagListRef}
      className={classnames(s.overflowTagList, 'flex gap-1.5 items-center')}
    >
      {renderTags(value)}
      {showOverlay ? (
        <div key="overlay" className={s.overlay}>
          <div className={s.overlayMask}></div>
          {!disableMore && (
            <Dropdown
              position="bottomRight"
              render={
                <div
                  className={classnames(
                    'w-[230px] p-1.5 gap-1.5 flex flex-row flex-wrap',
                    {
                      [dropdownClassName as string]: dropdownClassName,
                    },
                  )}
                >
                  {renderTags(value)}
                </div>
              }
            >
              <IconButton
                className={classnames('w-full', 'h-full')}
                wrapperClass={classnames(
                  'pointer-events-auto',
                  'text-[0px]',
                  'coz-bg-plus',
                  'w-[22px]',
                  'h-[20px]',
                )}
                style={{ height: '100%' }}
                size="mini"
                iconSize="small"
                icon={<IconCozMore />}
              />
            </Dropdown>
          )}
        </div>
      ) : null}
    </div>
  );
}
