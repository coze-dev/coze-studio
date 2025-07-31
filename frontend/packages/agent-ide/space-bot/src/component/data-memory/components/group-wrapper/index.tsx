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

import { type PropsWithChildren, type ReactNode, useState } from 'react';

import cls from 'classnames';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Collapsible } from '@coze-arch/coze-design';

export const VariableGroupWrapper = (
  props: PropsWithChildren<{
    variableGroup: {
      key: string | ReactNode;
      description: string | ReactNode;
    };
    defaultOpen?: boolean; // Add default expansion properties
    level?: number;
  }>,
) => {
  const { variableGroup, children, defaultOpen = true, level = 0 } = props;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isTopLevel = level === 0;
  return (
    <>
      <div
        className={cls(
          'flex w-full cursor-pointer flex-col px-1 py-2',
          isTopLevel && 'hover:coz-mg-secondary-hovered hover:rounded-lg ',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex w-full items-center">
          <div className="w-6 flex items-center">
            <IconCozArrowRight
              className={cls(
                'w-[14px] h-[14px] transition-all',
                isOpen ? 'rotate-90' : '',
              )}
            />
          </div>
          <div className="flex items-center">
            <div
              className={cls(
                'coz-stroke-primary text-xxl font-medium coz-fg-plus',
                {
                  '!text-sm my-[10px]': !isTopLevel,
                },
              )}
            >
              {variableGroup.key}
            </div>
          </div>
        </div>
        {isTopLevel ? (
          <div className="text-sm coz-fg-secondary pl-6">
            {variableGroup.description}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM isOpen={isOpen}>
        <div
          className={cls({
            'pl-3': !isTopLevel,
          })}
        >
          {children}
        </div>
      </Collapsible>
    </>
  );
};
