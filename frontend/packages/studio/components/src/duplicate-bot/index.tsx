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

import { type FC, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useRequest } from 'ahooks';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { openNewWindow, getParamsFromQuery } from '@coze-arch/bot-utils';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceList, useSpaceStore } from '@coze-arch/bot-studio-store';
import { SpaceApi } from '@coze-arch/bot-space-api';
import { type Size } from '@coze-arch/bot-semi/Button';
import { UIButton, Toast } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import {
  ProductEntityType,
  type ProductMetaInfo,
} from '@coze-arch/bot-api/product_api';
import { DeveloperApi, PlaygroundApi, ProductApi } from '@coze-arch/bot-api';

import { SelectSpaceModal } from '../select-space-modal';

const botDuplicateEvent = createReportEvent({
  eventName: ReportEventNames.botDuplicate,
});

interface DuplicateBotProps {
  storeCategory?: ProductMetaInfo['category'];
  botName?: string;
  botID?: string;
  isDisabled?: boolean;
  btnTxt?: string;
  pageFrom?: BotPageFromEnum;
  version?: string;
  buttonSize?: Size;
  enableCozeDesign?: boolean;
  /**
   * CozeDesign only takes effect in the case of
   */
  isBlock?: boolean;
  eventCallbacks?: Partial<{
    clickButton: () => void;
    duplicateFinished: ({ newBotId }: { newBotId: string }) => void;
  }>;
}

// eslint-disable-next-line -- Needs to be refactored
export const DuplicateBot: FC<DuplicateBotProps> = ({
  storeCategory,
  botName,
  botID,
  isDisabled,
  btnTxt,
  pageFrom,
  version,
  buttonSize,
  enableCozeDesign,
  isBlock,
  eventCallbacks,
}) => {
  const {
    space: { hide_operation, id: spaceID },
    getPersonalSpaceID,
  } = useSpaceStore();
  const { spaces: list = [] } = useSpaceList();

  const { pageFromFromStore } = usePageRuntimeStore(
    useShallow(state => ({
      pageFromFromStore: state.pageFrom,
    })),
  );
  const { botIdFromStore, botNameFromStore } = useBotInfoStore(
    useShallow(state => ({
      botIdFromStore: state.botId,
      botNameFromStore: state.name,
    })),
  );
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const { runAsync: copyAndOpenBot } = useRequest(
    // eslint-disable-next-line complexity
    async (targetSpaceId?: string, name?: string): Promise<string> => {
      botDuplicateEvent.start();

      let resp: {
        code?: string | number;
        msg?: string;
        data?: { bot_id?: string };
      };
      if (
        (pageFrom === BotPageFromEnum.Store ||
          pageFrom === BotPageFromEnum.Template) &&
        botID &&
        version &&
        targetSpaceId
      ) {
        if (pageFrom === BotPageFromEnum.Template) {
          const {
            code,
            message,
            data: { new_entity_id: newBotId } = {},
          } = await ProductApi.PublicDuplicateProduct({
            product_id: botID,
            entity_type: ProductEntityType.BotTemplate,
            space_id: targetSpaceId,
            name: name ?? '',
          });
          resp = {
            code,
            msg: message,
            data: {
              bot_id: newBotId,
            },
          };
        } else {
          resp = await PlaygroundApi.DuplicateBotVersionToSpace({
            bot_id: botID,
            version,
            target_space_id: targetSpaceId,
            name: name ?? '',
          });
        }

        //Copy complete, close the space pop-up window
        setShowSpaceModal(false);
      } else if (pageFromFromStore === BotPageFromEnum.Explore) {
        //When exploring, it can be copied to a certain space
        resp = await DeveloperApi.DuplicateBotToSpace({
          draft_bot_id: botIdFromStore,
          target_space_id: targetSpaceId || '',
          name,
        });

        //Copy complete, close the space pop-up window
        setShowSpaceModal(false);
      } else {
        resp = await SpaceApi.DuplicateDraftBot({
          bot_id: botIdFromStore,
        });
      }

      eventCallbacks?.duplicateFinished?.({
        newBotId: resp.data?.bot_id ?? '',
      });

      const botTeaparams = {
        bot_type:
          pageFromFromStore === BotPageFromEnum.Explore ||
          pageFromFromStore === BotPageFromEnum.Store
            ? 'store_bot'
            : 'team_bot',
        bot_id: botID ?? botIdFromStore,
        workspace_type:
          pageFromFromStore === BotPageFromEnum.Store
            ? 'store_workspace'
            : getPersonalSpaceID() === targetSpaceId
            ? 'personal_workspace'
            : 'team_workspace',
        bot_name: botName ?? botNameFromStore ?? '',
      };
      if (resp.code === 0) {
        sendTeaEvent(EVENT_NAMES.bot_duplicate_result, {
          ...botTeaparams,
          result: 'success',
        });
      } else {
        sendTeaEvent(EVENT_NAMES.bot_duplicate_result, {
          ...botTeaparams,
          result: 'failed',
          error_code: resp.code,
          error_message: resp.msg,
        });
      }

      const respData = resp.data;

      if (!respData) {
        throw new CustomError(
          ReportEventNames.botDuplicate,
          I18n.t('bot_copy_info_error'),
        );
      }
      const { bot_id: botId } = respData;
      if (!botID && !botIdFromStore) {
        throw new CustomError(
          ReportEventNames.botDuplicate,
          I18n.t('bot_copy_id_error'),
        );
      }

      const url = `${location.origin}/space/${
        targetSpaceId || spaceID
      }/bot/${botId}?from=copy`;

      return url;
    },
    {
      manual: true,
      onSuccess: () => {
        botDuplicateEvent.success();
      },
      onError: e => {
        botDuplicateEvent.error({ error: e, reason: e.message });
        setShowSpaceModal(false);
      },
    },
  );

  const beforeCopyClick = () => {
    eventCallbacks?.clickButton?.();
    sendTeaEvent(EVENT_NAMES.bot_duplicate_click, {
      bot_type:
        pageFromFromStore === BotPageFromEnum.Bot ? 'team_bot' : 'store_bot',
    });

    if (pageFrom === BotPageFromEnum.Store) {
      sendTeaEvent(EVENT_NAMES.bot_duplicate_click_front, {
        bot_type: 'store_bot',
        bot_id: botID,
        bot_name: botName,
        category_id: storeCategory?.id,
        category_name: storeCategory?.name,
        source: 'bots_store',
        from: getParamsFromQuery({ key: 'from' }),
      });
      setShowSpaceModal(true);
    } else if (pageFromFromStore === BotPageFromEnum.Explore) {
      sendTeaEvent(EVENT_NAMES.bot_duplicate_click_front, {
        bot_type: 'store_bot',
        bot_id: botNameFromStore,
        bot_name: botNameFromStore,
        source: 'explore_bot_detailpage',
        from: 'explore_card',
      });
      sendTeaEvent(EVENT_NAMES.click_bot_duplicate, {
        bot_id: botIdFromStore,
        bot_name: botNameFromStore,
        from: 'explore_card',
        source: 'explore_bot_detailpage',
      });
      //Explore the page Source: Select copy space when team > 1, otherwise copy to personal space
      if (list.length === 1) {
        openNewWindow(() => copyAndOpenBot(list?.[0].id));
      } else {
        setShowSpaceModal(true);
      }
    } else if (pageFrom === BotPageFromEnum.Template) {
      //Explore the page Source: Select copy space when team > 1, otherwise copy to personal space
      if (list.length === 1) {
        openNewWindow(() => copyAndOpenBot(list?.[0].id));
      } else {
        setShowSpaceModal(true);
      }
    } else {
      sendTeaEvent(EVENT_NAMES.bot_duplicate_click_front, {
        bot_type: 'team_bot',
        bot_id: botIdFromStore,
        bot_name: botNameFromStore,
        source: 'bots_detailpage',
        from: 'bots_card',
      });
      // Bot page source: If there is operation permission, directly copy it to the current space
      if (hide_operation) {
        Toast.warning('Bot in public space cannot duplicate');
        return;
      } else {
        openNewWindow(copyAndOpenBot);
      }
    }
  };

  return (
    <>
      {enableCozeDesign ? (
        <Button
          type="primary"
          theme="solid"
          size={buttonSize}
          onClick={beforeCopyClick}
          disabled={isDisabled}
          block={isBlock}
        >
          {btnTxt || I18n.t('duplicate')}
        </Button>
      ) : (
        <UIButton
          type="primary"
          theme="solid"
          size={buttonSize}
          onClick={beforeCopyClick}
          disabled={isDisabled}
        >
          {btnTxt || I18n.t('duplicate')}
        </UIButton>
      )}

      {/* Select space pop-up */}
      <SelectSpaceModal
        botName={botName ?? botNameFromStore}
        visible={showSpaceModal}
        onCancel={() => {
          setShowSpaceModal(false);
        }}
        onConfirm={(id, name) => {
          sendTeaEvent(EVENT_NAMES.click_create_bot_confirm, {
            click: 'success',
            create_type: 'duplicate',
            from: 'explore_card',
            source: 'explore_bot_detailpage',
          });
          openNewWindow(() => copyAndOpenBot(id, name));
        }}
      />
    </>
  );
};
