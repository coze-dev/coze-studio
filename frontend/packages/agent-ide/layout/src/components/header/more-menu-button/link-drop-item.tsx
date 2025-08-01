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

import { type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import copy from 'copy-to-clipboard';
import { useBoolean, useRequest } from 'ahooks';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  getBotDetailDtoInfo,
  updateHeaderStatus,
  updateBotRequest,
} from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import {
  Item,
  UIIconButton,
  Toast,
  Tooltip,
  Space,
  Image,
} from '@coze-arch/bot-semi';
import {
  ConnectorDynamicStatus,
  type ConnectorInfo,
} from '@coze-arch/bot-api/developer_api';
import { IconLink } from '@douyinfe/semi-icons';

import s from './index.module.less';

export type ExtendedConnectorInfo = Omit<ConnectorInfo, 'icon'> & {
  icon?: string | ReactNode;
};

export const LinkDropItem = (props: {
  linkInfo: ExtendedConnectorInfo;
  hasMorePlatform: boolean;
  isReadOnly: boolean;
}) => {
  const { linkInfo, hasMorePlatform, isReadOnly } = props;
  const [mouseIn, { setTrue, setFalse }] = useBoolean(false);
  const { botId, mode } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      mode: state.mode,
    })),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLinkCopy = (e: any) => {
    if (!linkInfo.share_link) {
      return;
    }
    e.stopPropagation();
    const res = copy(linkInfo.share_link);
    if (res) {
      Toast.success({
        showClose: false,
        content: I18n.t('copy_success'),
      });
    }
  };
  const { run: updateBot } = useRequest(
    async () => {
      if (!botId || isReadOnly) {
        return;
      }
      const { botSkillInfo } = getBotDetailDtoInfo();
      const { data } = await updateBotRequest({
        ...botSkillInfo,
        bot_mode: mode,
      });

      updateHeaderStatus(data);
    },
    {
      manual: true,
    },
  );

  const onConnectorClick = () => {
    updateBot();
    window.open(linkInfo.share_link);
  };

  const isDisableDropItem =
    linkInfo.connector_status !== ConnectorDynamicStatus.Normal ||
    hasMorePlatform;

  const content = (function () {
    return (
      <div className={s['link-item']}>
        <Space>
          {linkInfo.icon ? (
            typeof linkInfo.icon === 'string' ? (
              <Image
                src={linkInfo.icon}
                width={16}
                height={16}
                preview={false}
                className={s['link-img']}
              />
            ) : (
              <div className="w-4 h-4 rounded-mini [&_.semi-icon-default]:w-full [&_.semi-icon-default]:h-full [&_svg]:w-full [&_svg]:h-full">
                {linkInfo.icon}
              </div>
            )
          ) : null}
          <div> {linkInfo.name} </div>
        </Space>

        <Tooltip content={I18n.t('Copy_link')} position="right">
          {/* Flow currently does not support pasting and sharing links, coming soon.. */}
          {mouseIn &&
          linkInfo.share_link &&
          linkInfo.id !== FLOW_PUBLISH_ID &&
          !isReadOnly ? (
            <UIIconButton
              icon={<IconLink />}
              onClick={onLinkCopy}
              type="tertiary"
              className={s['copy-btn']}
              iconSize="small"
            />
          ) : null}
        </Tooltip>
      </div>
    );
  })();

  return (
    <Item
      onMouseEnter={setTrue}
      onMouseLeave={setFalse}
      disabled={isDisableDropItem}
      onClick={onConnectorClick}
    >
      {isDisableDropItem ? (
        <Tooltip
          content={
            hasMorePlatform
              ? I18n.t('bot_share_not_supported_opening')
              : I18n.t('bot_publish_token_expired_notice', {
                  platform: linkInfo.name,
                })
          }
          position="leftTop"
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Item>
  );
};
