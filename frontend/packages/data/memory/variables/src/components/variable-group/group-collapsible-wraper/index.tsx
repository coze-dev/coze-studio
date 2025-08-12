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

import { type FC, type PropsWithChildren, useState } from 'react';

import cls from 'classnames';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Collapsible } from '@coze-arch/coze-design';

import { type VariableGroup } from '@/store';

export const GroupCollapsibleWrapper: FC<
  PropsWithChildren<{
    groupInfo: VariableGroup;
    level?: number;
  }>
> = props => {
  const { groupInfo, children, level = 0 } = props;
  const [isOpen, setIsOpen] = useState(true);
  const isTopLevel = level === 0;
  return (
    <>
      <div
        className={cls(
          'flex w-full flex-col cursor-pointer px-1 py-2',
          isTopLevel ? 'hover:coz-mg-secondary-hovered hover:rounded-lg' : '',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="w-[22px] h-full flex items-center">
            <IconCozArrowRight
              className={cls('w-[14px] h-[14px]', isOpen ? 'rotate-90' : '')}
            />
          </div>
          <div className="w-[370px] h-full flex items-center">
            <div
              className={cls(
                'coz-stroke-primary text-xxl font-medium',
                !isTopLevel ? '!text-sm my-[10px]' : '',
              )}
            >
              {groupInfo.groupName}
            </div>
          </div>
        </div>
        {isTopLevel ? (
          <div className="text-sm coz-fg-secondary pl-[22px]">
            {groupInfo.groupDesc}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM isOpen={isOpen}>
        <div className={cls('w-full h-full', !isTopLevel ? 'pl-[18px]' : '')}>
          {children}
        </div>
      </Collapsible>
    </>
  );
};
