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

import classNames from 'classnames';
import { CozAvatar, Tag, Tooltip, Typography } from '@coze-arch/coze-design';
import { type PluginConnectorInfo } from '@coze-arch/bot-api/product_api';

import styles from './index.module.less';

interface ConnectorListProps {
  connectors: PluginConnectorInfo[];
  className?: string;
  visibleNum?: number;
}

const DEFAULT_VISIBLE_NUM = 3;

export const ConnectorList: React.FC<ConnectorListProps> = ({
  connectors,
  className,
  visibleNum = DEFAULT_VISIBLE_NUM,
}) => {
  const moreNum = connectors.length - visibleNum;
  return (
    <div className={classNames('ml-auto flex gap-4px', className)}>
      {connectors.slice(0, visibleNum).map(item => (
        <Tooltip key={item.id} content={item.name} theme="dark">
          <CozAvatar
            className="border coz-stroke-primary border-solid"
            size="micro"
            src={item.icon}
            type="platform"
          />
        </Tooltip>
      ))}
      {moreNum > 0 ? (
        <Tooltip
          position="right"
          content={
            <div className="flex flex-col gap-8px max-w-[200px] max-h-[188px] overflow-y-auto overflow-x-hidden">
              {connectors.slice(visibleNum).map(item => (
                <div
                  key={item.id}
                  className="flex gap-8px items-center max-w-full"
                >
                  <CozAvatar
                    className="border coz-stroke-primary border-solid"
                    size="micro"
                    src={item.icon}
                    type="platform"
                  />
                  <Typography.Text
                    ellipsis={true}
                    className="flex-1 overflow-hidden"
                  >
                    {item.name}
                  </Typography.Text>
                </div>
              ))}
            </div>
          }
        >
          <Tag className={styles.more} size="mini" color="primary">
            +{moreNum}
          </Tag>
        </Tooltip>
      ) : null}
    </div>
  );
};
