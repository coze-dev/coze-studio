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

import { I18n } from '@coze-arch/i18n';
import { List, Typography, UITag } from '@coze-arch/bot-semi';
import {
  type DiffDisplayNode,
  DiffActionType,
} from '@coze-arch/bot-api/dp_manage_api';
import {
  DIFF_TABLE_INDENT_BASE,
  DIFF_TABLE_INDENT_LENGTH,
  DiffNodeRender,
} from '@coze-agent-ide/agent-ide-commons';

import { flatDataSource } from '../../util';
import EmptyIcon from '../../assets/image/diff-empty.svg';
import { type FlatDiffDisplayNode } from './type';

import styles from './index.module.less';

const ActionTypeEnum = {
  [DiffActionType.Add]: 'devops_publish_multibranch_changeset_add',
  [DiffActionType.Delete]: 'devops_publish_multibranch_changeset_delete',
  [DiffActionType.Modify]: 'devops_publish_multibranch_changeset_modify',
  [DiffActionType.Remove]: 'devops_publish_multibranch_changeset_remove',
};

export const NewBotDiffView: React.FC<{
  diffData: DiffDisplayNode[];
  hasError: boolean;
  type?: 'diff' | 'publish';
}> = ({ diffData, hasError, type = 'diff' }) => (
  <div className={styles.container}>
    {diffData?.length > 0 ? (
      diffData.map(item => (
        <div className={styles['info-block']} key={item.display_name}>
          <div className={styles['info-title']}>{item.display_name}</div>
          {item?.sub_nodes?.length
            ? item?.sub_nodes?.map((node, index) => (
                <BotSubNode node={node} key={index} type={type} />
              ))
            : null}
        </div>
      ))
    ) : (
      <div className={styles['empty-container']}>
        <img src={EmptyIcon} />
        <Typography.Text className={styles['empty-info']}>
          {I18n.t(
            hasError
              ? 'devops_publish_multibranch_NetworkError'
              : 'devops_publish_multibranch_nodiff',
          )}
        </Typography.Text>
      </div>
    )}
    <div className="h-[32px]"></div>
    <div className={styles.mask}></div>
  </div>
);

export const BotSubNode: React.FC<{
  node: DiffDisplayNode;
  type?: 'diff' | 'publish';
}> = ({ node, type = 'diff' }) => {
  const { display_name } = node;
  return (
    <div>
      {display_name ? (
        <div className={styles['info-subtitle']}>{display_name}</div>
      ) : (
        <></>
      )}
      {node?.sub_nodes?.length ? (
        <BotDiffBlockTable blockDiffData={node?.sub_nodes} type={type} />
      ) : null}
    </div>
  );
};

export const BotDiffBlockTable: React.FC<{
  blockDiffData: DiffDisplayNode[];
  type: 'diff' | 'publish';
}> = ({ blockDiffData, type = 'diff' }) => {
  if (!blockDiffData) {
    return null;
  }
  const renderTitle = (node: FlatDiffDisplayNode) => (
    <Typography.Text
      ellipsis={{
        showTooltip: {
          opts: {
            content: node.display_name,
            className: styles['property-tooltip'],
          },
        },
      }}
      className={styles['property-title']}
    >
      {node.level > 0 ? (
        <Typography.Text
          style={{
            marginLeft:
              DIFF_TABLE_INDENT_BASE +
              DIFF_TABLE_INDENT_LENGTH * (node.level - 1),
            marginRight: 8,
          }}
        >
          -
        </Typography.Text>
      ) : null}
      {node.display_name}
    </Typography.Text>
  );
  const renderModify = (node: DiffDisplayNode) => {
    if (!node.diff_res || node.diff_res?.action === DiffActionType.Unknown) {
      return '';
    }
    return (
      <UITag className={styles[`tag-${node.diff_res.action}`]}>
        {I18n.t(ActionTypeEnum[node.diff_res.action])}
      </UITag>
    );
  };
  const renderView = (node: DiffDisplayNode) =>
    node?.diff_res?.action === DiffActionType.Modify ? (
      <DiffNodeRender
        left={node?.diff_res?.display_left || ''}
        right={node?.diff_res?.display_right || ''}
        node={node}
        type={type}
      />
    ) : (
      ''
    );

  return (
    <List
      dataSource={flatDataSource(blockDiffData)}
      bordered
      className={styles.list}
      renderItem={item => (
        <List.Item>
          <div className={styles['list-item']}>
            {renderTitle(item)}
            <div> {renderModify(item)}</div>

            {renderView(item)}
          </div>
        </List.Item>
      )}
    />
  );
};
