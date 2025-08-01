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

/* eslint-disable @coze-arch/max-line-per-function -- not easy to dismantle */
import React, { useCallback, useState } from 'react';

import { size } from 'lodash-es';
import classNames from 'classnames';
import { useBoolean, useRequest } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Button, Modal, Toast } from '@coze-arch/coze-design';
import { useSpaceList } from '@coze-arch/bot-studio-store';
import { MoveAction } from '@coze-arch/bot-api/playground_api';
import {
  DraftBotStatus,
  type DraftBot,
  SpaceType,
} from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { ItemGridView } from './components/item-grid-view';

interface BotMoveFailedModalOptions {
  /**
   * botInfo
   */
  botInfo: Pick<DraftBot, 'id' | 'name'> | null;
  /**
   * Update bot status
   */
  onUpdateBotStatus?: (status: DraftBotStatus) => void;
  /**
   * Successful migration is equivalent to deleting the bot
   */
  onMoveSuccess?: () => void;
}

interface UseBotMoveFailedModalValue {
  /**
   * How to open the pop-up window
   * @Param {BotMoveModalOptions} [options] - Open Modal's configuration item this time
   */
  open: (options?: BotMoveFailedModalOptions) => void;
  /**
   * How to close the pop-up window
   */
  close: () => void;
  /**
   * The pop-up component instance needs to be mounted manually.
   */
  modalNode: React.ReactNode;
}
const DefaultOptions: BotMoveFailedModalOptions = { botInfo: null };

// eslint-disable-next-line complexity
export function useBotMoveFailedModal(): UseBotMoveFailedModalValue {
  const [options, setOptions] =
    useState<BotMoveFailedModalOptions>(DefaultOptions);
  const [visible, { setTrue: setVisibleTrue, setFalse: setVisibleFalse }] =
    useBoolean(false);

  const [paneType, setPaneType] = useState<
    'detail' | 'confirm_cancel' | 'confirm_force'
  >('detail');

  const title = (
    <span className="mb-[20px] coz-fg-plus text-[16px] font-medium leading-[22px]">
      {paneType === 'detail'
        ? I18n.t('move_failed')
        : paneType === 'confirm_cancel'
        ? I18n.t('move_failed_cancel_confirm_title')
        : paneType === 'confirm_force'
        ? I18n.t('move_failed_force_confirm_title')
        : ''}
    </span>
  );

  const open = useCallback((opts?: BotMoveFailedModalOptions) => {
    setOptions(opts || DefaultOptions);
    setPaneType('detail');
    setVisibleTrue();
  }, []);
  const close = useCallback(() => {
    setVisibleFalse();
  }, []);

  const { spaces } = useSpaceList();
  const fromSpaceID =
    spaces?.find(s => s.space_type === SpaceType.Personal)?.id ?? '';

  const { data: moveDetails } = useRequest(
    async () => {
      if (!options.botInfo) {
        return;
      }
      const data = await PlaygroundApi.MoveDraftBot({
        bot_id: options.botInfo.id,
        from_spaceId: fromSpaceID,
        move_action: MoveAction.ViewTask,
      });
      return data.async_task;
    },
    { refreshDeps: [options.botInfo] },
  );

  const { loading, run } = useRequest(
    async (moveAction: MoveAction) => {
      const data = await PlaygroundApi.MoveDraftBot({
        bot_id: options.botInfo.id,
        from_spaceId: fromSpaceID,
        move_action: moveAction,
      });
      return { ...data, moveAction };
    },
    {
      manual: true,
      onSuccess: data => {
        if (data.bot_status === DraftBotStatus.Using) {
          if (data.moveAction === MoveAction.CancelTask) {
            options.onUpdateBotStatus?.(data.bot_status);
          } else {
            Toast.success(I18n.t('resource_move_bot_success_toast'));
            options.onMoveSuccess?.();
          }
          close();
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

  const retry = async () => {
    await run(MoveAction.RetryMove);
  };
  const forceMove = async () => {
    await run(MoveAction.ForcedMove);
  };
  const cancelMove = async () => {
    await run(MoveAction.CancelTask);
  };

  const footer = (
    <div
      className={classNames(
        'coz-modal-footer flex gap-2 justify-end',
        'w-full',
      )}
    >
      {paneType === 'detail' ? (
        <>
          <Button
            className="flex-1 !ml-0"
            size="large"
            color="primary"
            disabled={!moveDetails || loading}
            onClick={() => {
              setPaneType('confirm_cancel');
            }}
          >
            {I18n.t('move_failed_btn_cancel')}
          </Button>
          <Button
            className="flex-1 !ml-0"
            size="large"
            color="primary"
            disabled={!moveDetails || loading}
            onClick={() => {
              setPaneType('confirm_force');
            }}
          >
            {I18n.t('move_failed_btn_force')}
          </Button>
          <Button
            className="flex-1 !ml-0"
            color="brand"
            size="large"
            loading={loading}
            disabled={!moveDetails || loading}
            onClick={() => {
              retry();
            }}
          >
            {I18n.t('Retry')}
          </Button>
        </>
      ) : null}
      {paneType === 'confirm_cancel' ? (
        <>
          <Button
            className="!ml-0"
            color="primary"
            onClick={() => {
              setPaneType('detail');
            }}
          >
            {I18n.t('back')}
          </Button>
          <Button
            className="!ml-0"
            color="brand"
            loading={loading}
            onClick={() => {
              cancelMove();
            }}
          >
            {I18n.t('confirm')}
          </Button>
        </>
      ) : null}
      {paneType === 'confirm_force' ? (
        <>
          <Button
            className="!ml-0"
            color="primary"
            onClick={() => {
              setPaneType('detail');
            }}
          >
            {I18n.t('back')}
          </Button>
          <Button
            className="!ml-0"
            color="brand"
            loading={loading}
            onClick={() => {
              forceMove();
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
      width={paneType !== 'detail' ? '448px' : '480px'}
      footerFill
      onCancel={close}
      closable={!['confirm_cancel', 'confirm_force'].includes(paneType)}
      maskClosable={false}
      keepDOM={false}
      closeIcon={<IconCozCross className="coz-fg-secondary" />}
    >
      {paneType === 'detail' ? (
        <div className="flex flex-col">
          <div className="w-full border-[0.5px] border-solid coz-stroke-primary mb-[12px]"></div>
          <div className="flex flex-col max-h-[406px] overflow-y-auto">
            <div className="flex items-center gap-x-[8px] p-[8px] w-full coz-mg-primary rounded-[6px] mb-[12px]">
              <p className="text-[12px] leading-[16px] font-[400] coz-fg-secondary text-left align-top grow">
                {I18n.t('move_failed_desc')}
              </p>
            </div>
            {size(moveDetails?.transfer_resource_plugin_list) > 0 ? (
              <ItemGridView
                title={I18n.t('store_search_recommend_result2')}
                resources={moveDetails?.transfer_resource_plugin_list.map(
                  item => ({
                    ...item,
                    spaceID: item.status
                      ? moveDetails?.task_info.TargetSpaceId
                      : moveDetails?.task_info.OriSpaceId,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(`/space/${spaceID}/plugin/${id}`);
                }}
                showStatus
              />
            ) : null}
            {size(moveDetails?.transfer_resource_workflow_list) > 0 ? (
              <ItemGridView
                title={I18n.t('store_search_recommend_result3')}
                resources={moveDetails?.transfer_resource_workflow_list.map(
                  item => ({
                    ...item,
                    spaceID: item.status
                      ? moveDetails?.task_info.TargetSpaceId
                      : moveDetails?.task_info.OriSpaceId,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(
                    `/work_flow?space_id=${spaceID}&workflow_id=${id}`,
                  );
                }}
                showStatus
              />
            ) : null}
            {size(moveDetails?.transfer_resource_knowledge_list) > 0 ? (
              <ItemGridView
                title={I18n.t('performance_knowledge')}
                resources={moveDetails?.transfer_resource_knowledge_list.map(
                  item => ({
                    ...item,
                    spaceID: item.status
                      ? moveDetails?.task_info.TargetSpaceId
                      : moveDetails?.task_info.OriSpaceId,
                  }),
                )}
                onResourceClick={(id, spaceID) => {
                  window.open(`/space/${spaceID}/knowledge/${id}`);
                }}
                showStatus
              />
            ) : null}
          </div>
        </div>
      ) : null}
      {paneType === 'confirm_force' ? (
        <div className="mt-[20px]">
          {I18n.t('move_failed_force_confirm_content')}
        </div>
      ) : null}
      {paneType === 'confirm_cancel' ? (
        <div className="mt-[20px]">
          {I18n.t('move_failed_cancel_confirm_content')}
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
