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

import { type FC } from 'react';

import classnames from 'classnames';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { Popover, Space } from '@coze-arch/coze-design';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { NodeIcon } from '../../../components/node-icon';
import { getLabelPath } from './utils';
import { useTreeVariableSelectorContext } from './context';

import styles from './index.module.less';

const findRootNode = (value: string[], dataSource: TreeNodeData[]) => {
  const [nodeId] = value;
  if (!nodeId) {
    return {};
  }

  const nodeInfo = dataSource.find(item => item.value === nodeId);

  return nodeInfo ?? {};
};

export const ValueDisplay: FC<WithCustomStyle> = props => {
  const {
    value,
    dataSource,
    invalidContent,
    valueSubVariableMeta,
    displayVarName: variableName,
    isUnknownValue,
  } = useTreeVariableSelectorContext();
  const { className } = props;

  if (!value || !valueSubVariableMeta?.name) {
    return null;
  }

  if (isUnknownValue) {
    return invalidContent ? (
      <span className="absolute h-full max-w-[calc(100% - 8px)] truncate">
        <span
          className="flex items-center h-full text-sm"
          style={{
            color: 'var(--semi-color-text-0)',
          }}
        >
          {invalidContent}
        </span>
      </span>
    ) : null;
  }

  const rootNode = findRootNode(value, dataSource ?? []);

  const path = getLabelPath(dataSource ?? [], value as string[]);
  const content = path.slice(1).join('/');

  return (
    <Popover
      showArrow
      position="top"
      trigger="hover"
      spacing={20}
      className={styles.popoverContainer}
      content={
        <div className={classnames(styles.popover, 'cursor-pointer')}>
          <div className={styles.header}>
            <NodeIcon size={16} nodeId={rootNode.value as string} />
            <p className={styles.title}>{rootNode.label}</p>
          </div>
          <div className={styles.content}>
            <p>{content}</p>
          </div>
        </div>
      }
    >
      <span
        className={classnames(
          'absolute h-full max-w-[calc(100% - 8px)]',
          'semi-tree-select-selection-TriggerSearchItem',
          className,
        )}
      >
        <span
          className={
            'text-xs inline-block h-full truncate cursor-text max-w-full'
          }
        >
          <Space spacing={4} className="h-full">
            <span
              className="font-semibold"
              style={{
                color: 'var(--coz-fg-secondary)',
              }}
            >
              {rootNode.label}
            </span>
            <span
              className="font-semibold"
              style={{
                color: 'var(--coz-fg-secondary)',
              }}
            >
              -
            </span>
            <span className="truncate">{variableName}</span>
          </Space>
        </span>
      </span>
    </Popover>
  );
};
