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

/* eslint-disable @coze-arch/max-line-per-function -- difficult to remove*/
import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import { useBoolean, useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { useSpaceList } from '@coze-arch/bot-studio-store';
import { MoveAction } from '@coze-arch/bot-api/playground_api';
import {
  DraftBotStatus,
  type DraftBot,
  SpaceType,
} from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { cozeMitt } from '@coze-common/coze-mitt';
import { IconInfo } from '@coze-arch/bot-icons';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  Modal,
  Toast,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

import { useSelectSpacePane } from './components/select-space-pane';
import { MoveDetailPane } from './components/move-detail-pane';

interface BotMoveModalOptions {
  /**
   * botInfo
   */
  botInfo: Pick<DraftBot, 'name' | 'id'> | null;
  /**
   * Update bot status
   */
  onUpdateBotStatus?: (status: DraftBotStatus) => void;
  /**
   * Successful migration is equivalent to deleting the bot
   */
  onMoveSuccess?: () => void;
  /**
   * Close modal
   */
  onClose?: () => void;
}

interface UseBotMoveModalValue {
  /**
   * How to open the pop-up window
   * @Param {BotMoveModalOptions} [options] - Open Modal's configuration item this time
   */
  open: (options?: BotMoveModalOptions) => void;
  /**
   * How to close the pop-up window
   */
  close: () => void;
  /**
   * The pop-up component instance needs to be mounted manually.
   */
  modalNode: React.ReactNode;
}
const DefaultOptions: BotMoveModalOptions = { botInfo: null };

export function useBotMoveModal(): UseBotMoveModalValue {
  const [options, setOptions] = useState<BotMoveModalOptions>(DefaultOptions);
  const [visible, { setTrue: setVisibleTrue, setFalse: setVisibleFalse }] =
    useBoolean(false);

  const [paneType, setPaneType] = useState<'select' | 'move' | 'confirm'>(
    'select',
  );
  const { targetSpace, selectSpacePane, setTargetSpace } = useSelectSpacePane();

  const title =
    paneType !== 'confirm' ? (
      <div className="flex justify-start items-center mb-[24px] w-[380px]">
        <div className="coz-fg-plus text-[16px] font-medium leading-[22px] max-w-full">
          <Typography.Text
            ellipsis={{
              showTooltip: true,
            }}
            className="text-[16px]"
          >
            {I18n.t('resource_move_title', {
              bot_name: options.botInfo?.name ?? '',
            })}
          </Typography.Text>
        </div>
        <Tooltip content={I18n.t('resource_move_notice')}>
          <IconButton
            size="small"
            color="secondary"
            icon={<IconInfo className="coz-fg-secondary" />}
          />
        </Tooltip>
      </div>
    ) : (
      I18n.t('resource_move_confirm_title')
    );

  const open = useCallback((opts?: BotMoveModalOptions) => {
    setOptions(opts || DefaultOptions);
    setPaneType('select');
    setTargetSpace(null);
    setVisibleTrue();
  }, []);
  const close = useCallback(() => {
    setVisibleFalse();
  }, []);

  const { spaces } = useSpaceList();
  const fromSpaceID = spaces.find(s => s.space_type === SpaceType.Personal)?.id;

  const { loading: moveLoading, run: moveBot } = useRequest(
    async () => {
      const data = await PlaygroundApi.MoveDraftBot({
        bot_id: options.botInfo.id,
        target_spaceId: targetSpace.id,
        from_spaceId: fromSpaceID,
        move_action: MoveAction.Move,
      });
      return data;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data.bot_status === DraftBotStatus.Using) {
          Toast.success(I18n.t('resource_move_bot_success_toast'));
          options.onMoveSuccess?.();
          close();
          cozeMitt.emit('refreshFavList', {
            numDelta: -1,
          });
        } else if (data.bot_status === DraftBotStatus.MoveFail) {
          options.onUpdateBotStatus?.(data.bot_status);
          Toast.error({
            content: withSlardarIdButton(I18n.t('move_failed_toast')),
          });
          close();
        }
      },
      onError: error => {
        Toast.error({
          content: withSlardarIdButton(
            error?.message || I18n.t('move_failed_toast'),
          ),
          showClose: false,
        });
        close();
      },
    },
  );

  const onConfirm = async () => {
    await moveBot();
  };

  const [moveDisabled, setMoveDisabled] = useState(true);
  const footer = (
    <div
      className={classNames(
        'coz-modal-footer flex gap-2 justify-end',
        paneType !== 'confirm' && 'w-full',
      )}
    >
      {paneType === 'select' ? (
        <Button
          className="flex-1 !ml-0"
          color="brand"
          size="large"
          disabled={!targetSpace}
          onClick={() => {
            setPaneType('move');
          }}
        >
          {I18n.t('next')}
        </Button>
      ) : null}
      {paneType === 'move' ? (
        <>
          <Button
            className="flex-1 !ml-0"
            size="large"
            color="primary"
            onClick={() => {
              setPaneType('select');
            }}
          >
            {I18n.t('back')}
          </Button>
          <Button
            className="flex-1 !ml-0"
            color="brand"
            size="large"
            disabled={moveDisabled}
            onClick={() => {
              setPaneType('confirm');
            }}
          >
            {I18n.t('resource_move')}
          </Button>
        </>
      ) : null}
      {paneType === 'confirm' ? (
        <>
          <Button
            className="!ml-0"
            color="primary"
            onClick={() => {
              setPaneType('move');
            }}
          >
            {I18n.t('back')}
          </Button>
          <Button
            className="!ml-0"
            color="brand"
            loading={moveLoading}
            onClick={() => {
              onConfirm();
            }}
          >
            {I18n.t('confirm')}
          </Button>
        </>
      ) : null}
    </div>
  );

  const modalNode = (
    <Modal
      visible={visible}
      title={title}
      footer={footer}
      width={paneType === 'confirm' ? '448px' : '480px'}
      footerFill
      onCancel={() => {
        close?.();
        options.onClose?.();
      }}
      closable={paneType !== 'confirm'}
      maskClosable={false}
      keepDOM={false}
      closeIcon={<IconCozCross className="coz-fg-secondary" />}
    >
      {paneType === 'select' ? selectSpacePane : null}
      {paneType === 'move' ? (
        <>
          <MoveDetailPane
            targetSpace={targetSpace}
            botID={options.botInfo.id}
            fromSpaceID={fromSpaceID}
            onUnmount={() => setMoveDisabled(true)}
            onDetailLoaded={() => setMoveDisabled(false)}
          />
          {IS_CN_REGION ? (
            <div className="coz-fg-hglt-red">{I18n.t('move_desc1')}</div>
          ) : null}
        </>
      ) : null}
      {paneType === 'confirm' ? (
        <div className="mt-[20px]">
          {I18n.t('resource_move_confirm_content')}
        </div>
      ) : null}
    </Modal>
  );

  return {
    modalNode,
    open,
    close,
  };
}
