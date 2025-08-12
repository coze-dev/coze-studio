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

import { type FC, type ReactNode } from 'react';

import classNames from 'classnames';
import { Typography, Highlight } from '@coze-arch/coze-design';

interface LibraryItemProps {
  title: string;
  description?: string;
  avatar: string;
  icons?: ReactNode;
  actions?: ReactNode;
  className?: string;
  searchWords?: string[];
}
export const LibraryItem: FC<LibraryItemProps> = ({
  title,
  description,
  avatar,
  icons,
  actions,
  className,
  searchWords,
}) => (
  <div
    className={classNames(
      'w-full flex flex-row items-center coz-bg-max rounded-[8px]',
      ' gap-3',
      className,
    )}
  >
    <div
      className={classNames(
        'flex flex-row flex-1 min-w-[0px] justify-center items-center ',
      )}
    >
      {avatar ? (
        <img
          src={avatar}
          className={classNames(
            'w-[24px] h-[24px] rounded-[5px]',
            'overflow-hidden',
          )}
        />
      ) : null}
      <div
        className={classNames(
          'ml-[8px]',
          'flex flex-col flex-1 min-w-[0px] w-0',
        )}
      >
        <div className="flex flex-row items-center overflow-hidden">
          <Typography.Paragraph
            ellipsis={{
              showTooltip: true,
            }}
            className={classNames(
              'text-[14px] leading-[20px]',
              'coz-fg-primary truncate flex-1 font-medium',
            )}
          >
            <Highlight
              sourceString={title}
              searchWords={searchWords}
              highlightStyle={{
                color: 'var(--coz-fg-hglt-yellow, #FF7300)',
                backgroundColor: 'transparent',
              }}
            />
          </Typography.Paragraph>

          <div className="justify-self-end grid grid-flow-col gap-x-[2px]">
            {icons}
          </div>
        </div>
      </div>
    </div>
    <div className={classNames('grid grid-flow-col gap-x-[2px]')}>
      {actions}
    </div>
  </div>
);
