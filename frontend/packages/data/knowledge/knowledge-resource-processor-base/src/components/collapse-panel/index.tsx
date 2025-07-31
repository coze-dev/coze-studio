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

import { useState, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Collapsible, Typography } from '@coze-arch/coze-design';

export interface CollapsePanelProps extends PropsWithChildren {
  header: React.ReactNode;
  keepDOM?: boolean;
}

/**
 * A collapsible panel with Collapsible for better UI design
 */
export function CollapsePanel({
  header,
  keepDOM,
  children,
}: CollapsePanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-[4px]">
      <div
        className={classNames(
          'h-[40px] flex items-center gap-[4px] shrink-0 rounded',
          'cursor-pointer hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
        )}
        onClick={() => setOpen(!open)}
      >
        <IconCozArrowRight
          className={classNames('coz-fg-secondary text-[14px] m-[4px]', {
            'rotate-90': open,
          })}
        />
        <Typography.Text fontSize="14px" weight={400}>
          {header}
        </Typography.Text>
      </div>
      <Collapsible
        className="ml-[26px] [&>div]:pt-[4px]"
        isOpen={open}
        keepDOM={keepDOM}
      >
        {children}
      </Collapsible>
    </div>
  );
}
