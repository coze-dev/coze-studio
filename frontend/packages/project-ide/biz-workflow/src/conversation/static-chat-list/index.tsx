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
 
import { scroller } from 'react-scroll';
import React, { useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEdit,
  IconCozPlus,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';
import { IconButton, Typography } from '@coze-arch/coze-design';
import { type ProjectConversation } from '@coze-arch/bot-api/workflow_api';

import { TitleWithTooltip } from '../title-with-tooltip';
import commonStyles from '../conversation-content/index.module.less';
import { EditInput } from '../conversation-content/edit-input';
import { DEFAULT_UNIQUE_ID, type ErrorCode } from '../constants';

import s from './index.module.less';

const { Text } = Typography;

export const StaticChatList = ({
  canEdit,
  list,
  activateChat,
  updateLoading,
  onUpdate,
  onDelete,
  onValidate,
  onSelectChat,
  renderCreateInput,
  handleCreateInput,
}: {
  canEdit?: boolean;
  list: ProjectConversation[];
  activateChat?: ProjectConversation;
  updateLoading: boolean;
  onUpdate: (uniqueId: string, conversationName: string) => void;
  onDelete: (chatItem: ProjectConversation) => Promise<void>;
  onValidate: (_input: string) => ErrorCode | undefined;
  onSelectChat: (chatItem: ProjectConversation) => void;
  renderCreateInput: () => React.ReactNode;
  handleCreateInput?: () => void;
}) => {
  // 存储 session_id
  const [editingUniqueId, setEditingUniqueId] = useState('');

  const handleEditSession = (inputStr?: string, error?: ErrorCode) => {
    if (!error) {
      onUpdate(editingUniqueId, inputStr || '');
    }
    setEditingUniqueId('');
  };

  const handleSessionVisible = (_uniqueId?: string) => {
    setEditingUniqueId(_uniqueId || '');
  };

  /**
   * ux @wangwenbo.me 设计，default 放在首位，
   * 剩余的接口返回按照创建先后顺序倒序排序（后创建的放前边）
   */
  return (
    <>
      <TitleWithTooltip
        className={s.title}
        title={I18n.t('project_conversation_list_static_title')}
        tooltip={I18n.t('wf_chatflow_104')}
        extra={
          canEdit && (
            <IconButton
              icon={<IconCozPlus />}
              color="highlight"
              size="small"
              onClick={handleCreateInput}
            />
          )
        }
        onClick={() =>
          scroller.scrollTo('static', {
            duration: 200,
            smooth: true,
            containerId: 'conversation-list',
          })
        }
      />
      <div className={s['list-container']}>
        <div
          className={classNames(
            commonStyles['chat-item'],
            activateChat?.unique_id === list[0]?.unique_id &&
              commonStyles['chat-item-activate'],
          )}
          key={list[0]?.unique_id}
          onClick={() => onSelectChat(list[0])}
        >
          <Text ellipsis={{ showTooltip: true }}>
            {list[0]?.conversation_name}
          </Text>
        </div>
        {renderCreateInput()}
        {list.slice(1).map(item => (
          <div
            className={classNames(
              commonStyles['chat-item'],
              activateChat?.unique_id === item.unique_id &&
                commonStyles['chat-item-activate'],
              editingUniqueId === item.unique_id &&
                commonStyles['chat-item-editing'],
            )}
            key={item.unique_id}
            onClick={() => onSelectChat(item)}
          >
            {editingUniqueId === item.unique_id ? (
              <EditInput
                loading={updateLoading}
                defaultValue={item.conversation_name}
                onBlur={handleEditSession}
                onValidate={onValidate}
              />
            ) : (
              <Text ellipsis={{ showTooltip: true }}>
                {item.conversation_name}
              </Text>
            )}
            {editingUniqueId === item.unique_id ||
            item.unique_id === DEFAULT_UNIQUE_ID ||
            !canEdit ? null : (
              <div className={commonStyles.icons}>
                <IconButton
                  size="small"
                  color="secondary"
                  icon={<IconCozEdit />}
                  onClick={e => {
                    e.stopPropagation();
                    handleSessionVisible(item.unique_id);
                  }}
                />
                {/* 默认会话不可删除 */}
                <IconButton
                  size="small"
                  color="secondary"
                  icon={<IconCozTrashCan />}
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
