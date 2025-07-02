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
