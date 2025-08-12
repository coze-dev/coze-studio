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

import { unix } from 'dayjs';
import cs from 'classnames';
import { useBoolean } from 'ahooks';
import { IconSpin } from '@douyinfe/semi-icons';
import { BotE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import {
  UITag,
  UIButton,
  Typography,
  Space,
  Avatar,
  Popover,
} from '@coze-arch/bot-semi';
import { IconNote } from '@coze-arch/bot-icons';
import {
  OrderField,
  type Dataset,
  DatasetStatus,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';
import { SpaceType } from '@coze-arch/bot-api/developer_api';

import { getEllipsisCount, formatBytes } from '../../utils';
import { FilePopover } from './components';

import styles from './index.module.less';

const { Text } = Typography;

export interface DatasetCardListVerticalOperations {
  onAdd: (dataset: Dataset) => void | Promise<void>;
  onRemove: (dataset: Dataset) => void | Promise<void>;
  isAdded: (id: string) => boolean;
}

function AddedButton(buttonProps: ButtonProps) {
  const [isMouseIn, { setFalse, setTrue }] = useBoolean(false);

  const onMouseEnter = () => {
    setTrue();
  };
  const onMouseLeave = () => {
    setFalse();
  };

  return (
    <UIButton
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...buttonProps}
      className={cs({
        [buttonProps.className || '']: Boolean(buttonProps.className),
        [styles.addedMouseIn]: isMouseIn,
      })}
    >
      {isMouseIn ? I18n.t('Remove') : I18n.t('Added')}
    </UIButton>
  );
}

export type DatasetCardListVerticalProps = DatasetCardListVerticalOperations & {
  list: Dataset[];
  loading: boolean;
  noMore: boolean;
  searchType: OrderField;
  onClickKnowledgeDetail?: (knowledgeID: string) => void;
};

const DEFAULT_BOT_NUM = 99;

const SpaceTags = (item: Dataset) => (
  <Space className={styles.tags} wrap>
    {item.processing_file_list?.length ? (
      <FilePopover fileNames={item.processing_file_list || []}>
        <UITag color="teal" className={styles['file-list']}>
          {I18n.t('dataset_data_processing_tag', {
            num: item.processing_file_list?.length || 0,
          })}
        </UITag>
      </FilePopover>
    ) : null}
    <UITag color="grey">
      {formatBytes(parseInt(String(item.all_file_size)))}
    </UITag>
    {item.file_list?.length ? (
      <Popover
        trigger="hover"
        showArrow
        content={
          <div className={styles['file-list-details']}>
            <div className={styles['dataset-name']}>{item.name || ''}</div>
            <div className={styles['file-info']}>
              {item.file_list?.map(fileInfo => (
                <div className={styles['file-info-item']} key={fileInfo}>
                  <IconNote className={styles['icon-note']} />
                  {fileInfo}
                </div>
              ))}
            </div>
          </div>
        }
      >
        <UITag color="grey">
          {I18n.t('dataset_bot_count_tag', {
            num: getEllipsisCount(item.file_list?.length || 0, DEFAULT_BOT_NUM),
          })}
        </UITag>
      </Popover>
    ) : (
      <UITag color="grey">
        {I18n.t('dataset_bot_count_tag', {
          num: getEllipsisCount(item.file_list?.length || 0, DEFAULT_BOT_NUM),
        })}
      </UITag>
    )}
    {item.storage_location === StorageLocation.OpenSearch ? (
      <UITag color="cyan">{I18n.t('knowledge_es_001')}</UITag>
    ) : null}
  </Space>
);

export const KnowledgeCardListVertical: FC<DatasetCardListVerticalProps> = ({
  list,
  loading,
  noMore,
  onAdd,
  onRemove,
  isAdded,
  searchType,
  onClickKnowledgeDetail,
}) => {
  const { id: spaceId, space_type } = useSpaceStore(s => s.space);

  const isPersonal = space_type === SpaceType.Personal;

  const handleRow = (e: { stopPropagation: () => void }, id: string) => {
    e.stopPropagation();
    if (onClickKnowledgeDetail) {
      onClickKnowledgeDetail(id);
    } else {
      window.open(`/space/${spaceId}/knowledge/${id}`);
    }
  };

  return (
    <div className={styles.container}>
      {list.map(item => (
        <div
          className={styles.item}
          key={item.dataset_id || ''}
          onClick={e => handleRow(e, item?.dataset_id || '')}
        >
          <Avatar shape="square" src={item.icon_url} className={styles.left} />

          <div
            className={styles.content}
            data-testid={`${BotE2e.BotKnowledgeSelectListModalName}.${item.name}`}
            data-dtestid={`${BotE2e.BotKnowledgeSelectListModalName}.${item.name}`}
          >
            <Text className={styles.title} ellipsis={{ showTooltip: true }}>
              {item.name || ''}
            </Text>

            {item.description ? (
              <Typography.Text
                className={styles.description}
                ellipsis={{ rows: 1 }}
              >
                {item.description}
              </Typography.Text>
            ) : null}
            {!item.description && !!item.file_list?.length && (
              <Typography.Text
                className={styles.description}
                ellipsis={{ rows: 1 }}
              >
                {item.file_list?.join('、')}
              </Typography.Text>
            )}

            <div className={styles['tags-wapper']}>
              <SpaceTags {...item}></SpaceTags>

              <div className={styles.info}>
                {!isPersonal && (
                  <>
                    <Avatar
                      src={item.avatar_url}
                      style={{ width: 14, height: 14 }}
                    />
                    <Text
                      className={cs(styles.creator)}
                      ellipsis={{ showTooltip: true }}
                    >
                      {item.creator_name || ''}
                    </Text>
                    <span className={styles['border-right']}></span>
                  </>
                )}
                {searchType === OrderField.CreateTime ? (
                  <span className={styles.creator}>
                    {I18n.t('dataset_bot_create_time_knowledge', {
                      time: unix(item.create_time || 0).format(
                        'YYYY-MM-DD HH:mm',
                      ),
                    })}
                  </span>
                ) : (
                  <span className={styles.creator}>
                    {I18n.t('dataset_bot_update_time_knowledge', {
                      time: unix(item.update_time || 0).format(
                        'YYYY-MM-DD HH:mm',
                      ),
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className={styles.right}
            onClick={e => e.stopPropagation()}
            data-testid={`${BotE2e.BotKnowledgeSelectListModalAddBtn}.${item.name}`}
          >
            {isAdded(item.dataset_id || '') ? (
              <AddedButton
                className={cs(styles.button, styles.added)}
                onClick={() => onRemove(item)}
              >
                {I18n.t('Added')}
              </AddedButton>
            ) : (
              <UIButton
                disabled={item.status === DatasetStatus.DatasetForbid}
                className={styles.button}
                onClick={() => onAdd(item)}
                data-testid="bot.database.add.modal.add.button"
              >
                {I18n.t('Add_2')}
              </UIButton>
            )}
          </div>
        </div>
      ))}
      {loading ? (
        <div className={styles['loading-more']}>
          <IconSpin spin style={{ marginRight: '4px' }} />
          <div>{I18n.t('Loading')}</div>
        </div>
      ) : null}
      {noMore ? (
        <div className={styles['no-more']}>
          <div>{I18n.t('No_more')}</div>
        </div>
      ) : null}
    </div>
  );
};
