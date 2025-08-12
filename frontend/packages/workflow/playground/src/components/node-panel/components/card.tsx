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

import { type FC, type MouseEvent } from 'react';

import classNames from 'classnames';
import { Typography, Highlight } from '@coze-arch/coze-design';

import { NodeIconOutlined } from '@/components/node-icon';

import styles from './styles.module.less';

interface NodesContainerProps {
  className?: string;
  name: string;
  hideOutline?: boolean;
  icon: string;
  keyword?: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

export const NodeCard: FC<NodesContainerProps> = props => {
  const {
    name,
    icon,
    hideOutline = false,
    onClick,
    keyword,
    className,
  } = props;

  return (
    <div
      className={classNames(styles['node-card'], className)}
      key={name}
      onClick={onClick}
    >
      <NodeIconOutlined
        size={20}
        icon={icon}
        hideOutline={hideOutline}
        borderRadius="var(--coze-4)"
        outlineColor="var(--coz-stroke-plus)"
      />
      <Typography.Text
        className={classNames(
          styles['node-title'],
          "font-['PICO_Sans_VFE_SC']",
        )}
        ellipsis
      >
        <Highlight
          sourceString={name || ''}
          searchWords={keyword ? [keyword] : []}
          highlightStyle={{
            backgroundColor: 'transparent',
            color: 'var(--coz-fg-color-orange)',
            fontWeight: 400,
          }}
        />
      </Typography.Text>
    </div>
  );
};
