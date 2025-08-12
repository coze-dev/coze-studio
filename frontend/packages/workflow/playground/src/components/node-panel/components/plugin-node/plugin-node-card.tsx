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
import { IconCozCross, IconCozExpand } from '@coze-arch/coze-design/icons';
import { Typography, Highlight, IconButton } from '@coze-arch/coze-design';

import { NodeIconOutlined } from '@/components/node-icon';

import styles from './styles.module.less';
interface NodesContainerProps {
  className?: string;
  name: string;
  icon: string;
  keyword?: string;
  expand: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

export const PluginNodeCard: FC<NodesContainerProps> = props => {
  const { name, icon, onClick, keyword, expand } = props;

  return (
    <div
      className={classNames(styles['plugin-node-card'], {
        [styles.expand]: expand,
      })}
      key={name}
      onClick={onClick}
    >
      <NodeIconOutlined
        size={20}
        icon={icon}
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
      <div className={styles['expand-btn']}>
        <IconButton
          size="small"
          style={{ width: 20, height: 20, minWidth: 20 }}
          color="secondary"
          icon={
            expand ? (
              <IconCozCross className="coz-fg-secondary text-[16px]" />
            ) : (
              <IconCozExpand className="coz-fg-secondary text-[16px]" />
            )
          }
        />
      </div>
    </div>
  );
};
