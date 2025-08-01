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

import { useNavigate } from 'react-router-dom';
import { useRef, type FC } from 'react';

import { cozeMitt } from '@coze-common/coze-mitt';
import { logger } from '@coze-arch/logger';
import { type User } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze-arch/coze-design/icons';
import { Menu, Toast, Tooltip } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useUIModal } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { DeveloperApi } from '@coze-arch/bot-api';

export interface MenuCommonProps {
  id: string;
  spaceID: string;
}

export interface MenuAnalysisProps extends MenuCommonProps {
  disabled?: boolean;
}

export type AgentCopySuccessCallback = (param: {
  templateId: string;
  id: string;
  name: string;
  ownerInfo: Required<User>;
}) => void;

export const MenuAnalysis: FC<MenuAnalysisProps> = ({
  disabled,
  spaceID,
  id,
}) => {
  const navigate = useNavigate();

  return (
    <Menu.Item
      disabled={disabled}
      onClick={() => {
        navigate(`/space/${spaceID}/bot/${id}/analysis`);
      }}
    >
      {I18n.t('analytics_page_title')}
    </Menu.Item>
  );
};

export interface MenuCopyBotProps extends MenuCommonProps {
  disabled?: boolean;
  name?: string;

  onCopySuccess?: AgentCopySuccessCallback;
  onClose?: () => void;
}

export const MenuCopyBot: FC<MenuCopyBotProps> = ({
  disabled,
  id,
  name,
  spaceID,
  onCopySuccess,
  onClose,
}) => {
  const lock = useRef(false);

  const copyBot = async () => {
    try {
      lock.current = true;
      const response = await DeveloperApi.DuplicateDraftBot({
        space_id: spaceID,
        bot_id: id,
      });
      Toast.success({
        content: I18n.t('bot_duplicateded_toast'),
        showClose: false,
      });
      const {
        bot_id = '',
        name: newBotName = '',
        user_info = {},
      } = response.data;
      const {
        id: userId = '',
        name: userName = '',
        avatar_url = '',
        user_unique_name = '',
        user_label = {},
      } = user_info;
      onCopySuccess?.({
        templateId: id,
        id: bot_id,
        name: newBotName,
        ownerInfo: {
          user_id: userId,
          nickname: userName,
          avatar_url,
          user_unique_name,
          user_label,
        },
      });
    } catch (error) {
      logger.error({
        error: new CustomError('copy bot', 'copy bot error'),
      });
    } finally {
      onClose?.();
      lock.current = false;
    }
  };

  return (
    <Tooltip
      trigger={disabled ? 'custom' : 'hover'}
      content={I18n.t('coze_copy_to_tips_1')}
    >
      <Menu.Item
        data-testid="bot-card.copy"
        disabled={disabled}
        onClick={() => {
          if (lock.current) {
            return;
          }
          sendTeaEvent(EVENT_NAMES.bot_duplicate_click, {
            bot_type: 'team_bot',
          });
          // team bot header
          sendTeaEvent(EVENT_NAMES.bot_duplicate_click_front, {
            bot_type: 'team_bot',
            bot_id: id,
            bot_name: name,
            from: 'bots_card',
            source: 'bots_card',
          });
          copyBot();
        }}
      >
        {I18n.t('duplicate')}
      </Menu.Item>
    </Tooltip>
  );
};

export interface MenuDeleteBotProps extends MenuCommonProps {
  onDeleteSuccess?: () => void;
  onClick?: () => void;
  onClose?: () => void;
}

export const MenuDeleteBot: FC<MenuDeleteBotProps> = ({
  spaceID,
  id,
  onDeleteSuccess,
  onClick,
  onClose,
}) => {
  const deleteBot = async () => {
    try {
      await DeveloperApi.DeleteDraftBot({
        space_id: spaceID,
        bot_id: id,
      });
      Toast.success({
        content: I18n.t('bot_deleted_toast'),
        showClose: false,
      });
      onDeleteSuccess?.();
      cozeMitt.emit('refreshFavList', {
        id,
        numDelta: -1,
      });
    } catch (error) {
      logger.error({
        error: new CustomError('delete bot', 'delete bot error'),
      });
    }
  };

  const { open, close, modal } = useUIModal({
    type: 'info',
    title: I18n.t('bot_delete_confirm_title'),
    onOk: async () => await deleteBot(),
    okText: I18n.t('Delete'),
    cancelText: I18n.t('Cancel'),
    icon: <IconCozWarningCircleFill className="text-24px coz-fg-hglt-red" />,
    onCancel: () => {
      close();
      onClose?.();
    },
    okButtonProps: {
      type: 'danger',
    },
  });

  return (
    <>
      <Menu.Item
        type="danger"
        onClick={() => {
          open();
          onClick?.();
        }}
      >
        <span className="coz-fg-hglt-red">{I18n.t('Delete')}</span>
      </Menu.Item>
      {modal(
        <>
          {I18n.t('bot_list_delete_bot', {
            platform: FLOW_BRAND_NAME,
          })}
        </>,
      )}
    </>
  );
};
