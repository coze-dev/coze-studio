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

import { type CSSProperties, forwardRef, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { Badge, Button } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface TabbarItemProps {
  onClick: () => void;
  isActive: boolean;
  selectedConnectorCount: number;
}
export const ConnectorTabbarItem: React.FC<
  PropsWithChildren<TabbarItemProps>
> = ({ onClick, isActive, children, selectedConnectorCount }) => (
  <Button
    onClick={onClick}
    color={isActive ? 'highlight' : 'secondary'}
    className="!px-8px !font-medium"
  >
    {children}
    {selectedConnectorCount > 0 ? (
      <Badge
        countClassName={classNames(
          !isActive && '!coz-mg-plus !coz-fg-secondary',
          '!font-medium',
        )}
        className="ml-4px"
        count={selectedConnectorCount}
        type="alt"
      />
    ) : null}
  </Button>
);

export interface ConnectorTabbarProps {
  className?: string;
  style?: CSSProperties;
}

export const ConnectorTabbar = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ConnectorTabbarProps>
>(({ className, style, children }, ref) => (
  <div
    ref={ref}
    className={classNames(
      // ! 80Px height affects styles.mask calculation
      'flex items-center gap-x-8px h-[80px] relative',
      styles.mask,
      className,
    )}
    style={style}
  >
    {children}
  </div>
));
