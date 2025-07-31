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

/* eslint-disable @coze-arch/max-line-per-function */
import { scroller } from 'react-scroll';
import React, { useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import { useInViewport } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEmpty,
  IconCozTrashCan,
  IconCozListDisorder,
  IconCozCross,
} from '@coze-arch/coze-design/icons';
import {
  EmptyState,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Checkbox,
  Popconfirm,
} from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';
import { type ProjectConversation } from '@coze-arch/bot-api/workflow_api';

import { TitleWithTooltip } from '../title-with-tooltip';
import commonStyle from '../conversation-content/index.module.less';

import styles from './index.module.less';

const { Text } = Typography;

const ChatItem: React.FC<{
  chat: ProjectConversation;
  canEdit?: boolean;
  isActivate: boolean;
  isInBatch: boolean;
  isInBatchSelected: boolean;
  onBatchSelectChange: (data: ProjectConversation) => void;
  onActivate: (data: ProjectConversation) => void;
  onDelete: (data: ProjectConversation) => void;
}> = ({
  chat,
  isActivate,
  isInBatch,
  isInBatchSelected,
  canEdit,
  onBatchSelectChange,
  onActivate,
  onDelete,
}) => {
  const showActivate = isActivate && !isInBatch;
  const canDeleteOperate = canEdit && !isInBatch;

  const handleClick = () => {
    if (isInBatch) {
      onBatchSelectChange(chat);
    } else {
      onActivate(chat);
    }
  };
  return (
    <div
      className={classNames(
        commonStyle['chat-item'],
        showActivate && commonStyle['chat-item-activate'],
        isInBatchSelected && styles['is-batch-selected'],
      )}
      onClick={handleClick}
    >
      {isInBatch ? <Checkbox checked={isInBatchSelected} /> : null}
      <Text ellipsis={{ showTooltip: true }}>{chat.conversation_name}</Text>
      {canDeleteOperate ? (
        <div className={commonStyle.icons}>
          <IconButton
            size="small"
            color="secondary"
            icon={<IconCozTrashCan />}
            onClick={e => {
              e.stopPropagation();
              onDelete(chat);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export const DynamicChatList = ({
  canEdit,
  list,
  activateChat,
  onDelete,
  onBatchDelete,
  onSelectChat,
}: {
  canEdit?: boolean;
  list: ProjectConversation[];
  activateChat?: ProjectConversation;
  onDelete: (chatItem: ProjectConversation) => Promise<void>;
  onBatchDelete: (ids: string[]) => Promise<void>;
  onSelectChat: (chatItem: ProjectConversation) => void;
}) => {
  const [FLAGS] = useFlags();
  const [inBatch, setInBatch] = useState(false);
  const [batchSelected, setBatchSelected] = useState<
    Record<string, ProjectConversation | undefined>
  >({});
  const dynamicTopRef = useRef(null);
  const [inDynamicTopViewport] = useInViewport(dynamicTopRef);
  const batchSelectedList = useMemo(
    () =>
      Object.values(batchSelected).filter((i): i is ProjectConversation => !!i),
    [batchSelected],
  );
  const canBatchOperate =
    !!canEdit &&
    !!list?.length &&
    !inBatch &&
    // Support soon, so stay tuned.
    FLAGS['bot.automation.conversation_batch_delete'];
  const exitBatch = () => {
    setInBatch(false);
    setBatchSelected({});
  };
  const handleBatchSelectChange = (item: ProjectConversation) => {
    const key = item.unique_id || '';
    const next = batchSelected[key] ? undefined : item;
    setBatchSelected({
      ...batchSelected,
      [item.unique_id || '']: next,
    });
  };
  const handleBatchDelete = async (items: ProjectConversation[]) => {
    const ids = items.map(i => i.unique_id).filter((i): i is string => !!i);
    await onBatchDelete(ids);
    // Exit batch operation mode after successful deletion
    exitBatch();
  };
  return (
    <>
      <TitleWithTooltip
        className={classNames(
          styles.title,
          !inDynamicTopViewport && styles['is-bottom'],
        )}
        title={I18n.t('project_conversation_list_dynamic_title')}
        tooltip={I18n.t('wf_chatflow_44')}
        extra={
          canBatchOperate && (
            <Tooltip
              content={I18n.t(
                'project_conversation_list_operate_batch_tooltip',
              )}
            >
              <IconButton
                icon={<IconCozListDisorder />}
                size="small"
                color="secondary"
                onClick={() => setInBatch(true)}
              />
            </Tooltip>
          )
        }
        onClick={() =>
          scroller.scrollTo('dynamic', {
            duration: 200,
            smooth: true,
            containerId: 'conversation-list',
          })
        }
      />
      <div ref={dynamicTopRef} />
      <div
        className={classNames(
          styles['list-container'],
          inBatch && styles['in-batch'],
        )}
      >
        {list?.length ? (
          list.map(data => (
            <ChatItem
              chat={data}
              canEdit={canEdit}
              isActivate={data.unique_id === activateChat?.unique_id}
              isInBatch={inBatch}
              isInBatchSelected={!!batchSelected[data.unique_id || '']}
              onBatchSelectChange={handleBatchSelectChange}
              onActivate={onSelectChat}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className={styles['empty-container']}>
            <EmptyState
              size="default"
              icon={<IconCozEmpty />}
              title={I18n.t('wf_chatflow_41')}
              description={I18n.t('wf_chatflow_42')}
            />
          </div>
        )}
        {inBatch ? (
          <div className={styles['batch-wrap']}>
            <Popconfirm
              title={I18n.t('project_conversation_list_batch_delete_tooltip')}
              okText={I18n.t('delete_title')}
              cancelText={I18n.t('cancel')}
              content={I18n.t(
                'project_conversation_list_batch_delete_tooltip_context',
                {
                  len: batchSelectedList.length,
                },
              )}
              onConfirm={() => {
                handleBatchDelete(batchSelectedList);
              }}
            >
              <Button size="small" disabled={!batchSelectedList.length}>
                {I18n.t('project_conversation_list_batch_delete_btn', {
                  len: batchSelectedList.length,
                })}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={I18n.t('filebox_0040')}
              okText={I18n.t('filebox_0040')}
              cancelText={I18n.t('cancel')}
              content={I18n.t(
                'project_conversation_list_delete_all_tooltip_context',
              )}
              okButtonColor="red"
              onConfirm={() => {
                handleBatchDelete(list);
              }}
            >
              <Button size="small" color="redhglt">
                {I18n.t('url_add_008')}
              </Button>
            </Popconfirm>

            <IconButton
              size="small"
              color="secondary"
              icon={<IconCozCross />}
              onClick={exitBatch}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
