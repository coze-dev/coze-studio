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

/* eslint-disable @coze-arch/no-deep-relative-import */
import classNames from 'classnames';
import { List, Divider } from '@coze-arch/bot-semi';

import { type NodeError } from '../../../../../entities/workflow-exec-state-entity';
import { ErrorLineItem, ErrorNodeItem } from './error-item';

import styles from './index.module.less';

export const ErrorList = ({
  nodeErrorList,
  title,
}: {
  nodeErrorList: NodeError[];
  title: string;
}) => (
  <div>
    <List
      className={styles['execute-result-list']}
      header={
        <div
          className={classNames(
            'text-[12px] font-medium',
            styles['execute-result-list-title'],
          )}
        >
          {title}
        </div>
      }
      dataSource={nodeErrorList}
      renderItem={(item, index) => (
        <List.Item style={{ padding: 0 }} key={item.nodeId}>
          {item.errorType === 'line' ? (
            <ErrorLineItem nodeError={item} index={index} />
          ) : (
            <ErrorNodeItem nodeError={item} />
          )}
        </List.Item>
      )}
    />
    <Divider />
  </div>
);
