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
import React, { type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useIsPublishRecordReady } from '@coze-studio/publish-manage-hooks';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import MORE_PLATFORM_ICON from '@coze-common/assets/image/more-platform-icon.jpg';
import { I18n } from '@coze-arch/i18n';
import { Divider } from '@coze-arch/bot-semi';
import { IconMenuLogo } from '@coze-arch/bot-icons';
import { useFlags } from '@coze-arch/bot-flags';
import { IntelligenceType } from '@coze-arch/bot-api/intelligence_api';
import {
  BotMarketStatus,
  ConnectorDynamicStatus,
  type ConnectorInfo,
} from '@coze-arch/bot-api/developer_api';
import {
  IconCozArrowRightFill,
  IconCozMore,
} from '@coze-arch/coze-design/icons';
import { Dropdown, IconButton, Tooltip } from '@coze-arch/coze-design';

import { LinkDropItem } from './link-drop-item';

import s from './index.module.less';

export type ExtendedConnectorInfo = Omit<ConnectorInfo, 'icon'> & {
  icon?: string | React.ReactNode;
};

const LinkMenu = (props: {
  connectors: ExtendedConnectorInfo[];
  renderMorePlatform: boolean;
  isReadOnly: boolean;
}) => {
  const { connectors = [], renderMorePlatform, isReadOnly } = props;
  return (
    <Dropdown.Menu mode="menu">
      {!isReadOnly && (
        <>
          <div className={s['open-in-tips']}>
            {I18n.t('bot_list_open_button', {
              platform: '',
            })}
          </div>
          <Divider margin={2} layout="horizontal" />
        </>
      )}
      {connectors.map(item => (
        <LinkDropItem
          linkInfo={item}
          key={item.name}
          hasMorePlatform={false}
          isReadOnly={isReadOnly}
        />
      ))}
      {renderMorePlatform ? (
        <LinkDropItem
          linkInfo={{
            name: I18n.t('bot_share_more_platforms'),
            icon: MORE_PLATFORM_ICON,
          }}
          hasMorePlatform
          isReadOnly={isReadOnly}
        />
      ) : null}
    </Dropdown.Menu>
  );
};

// eslint-disable-next-line complexity, @coze-arch/max-line-per-function
export const MoreMenuButton: FC = () => {
  const { hasPublish, connectors, version, botId, spaceId, botMarketStatus } =
    useBotInfoStore(
      useShallow(state => ({
        botId: state.botId,
        spaceId: state.space_id,
        hasPublish: state.has_publish,
        connectors: state.connectors,
        version: state.version,
        botMarketStatus: state.botMarketStatus,
      })),
    );
  const { historyVisible } = usePageRuntimeStore(
    useShallow(state => ({
      historyVisible: state.historyVisible,
    })),
  );

  const isReadOnly = useBotDetailIsReadonly();

  const StoreConnector: ExtendedConnectorInfo = {
    id: 'store',
    name: I18n.t('bot_edit_store'),
    icon: (
      <div className="w-4 h-4 rounded-mini [&_.semi-icon-default]:w-full [&_.semi-icon-default]:h-full [&_svg]:w-full [&_svg]:h-full">
        <IconMenuLogo />
      </div>
    ),
    share_link: `${window.location.origin}/store/agent/${botId}?bot_id=true`,
    connector_status:
      botMarketStatus === BotMarketStatus.Online
        ? ConnectorDynamicStatus.Normal
        : ConnectorDynamicStatus.Offline,
  };
  const extendedConnectors = [
    ...(connectors as ExtendedConnectorInfo[]),
  ].concat(botMarketStatus === BotMarketStatus.Online ? [StoreConnector] : []);

  const hasMorePlatform = extendedConnectors?.some(item => !item.share_link);

  // Do not display open conditions 1. Bot from explore (no more explore) 2. Bot from unreleased platform 3. Bot of historical version (display after considering revert) 4. All released platforms do not share links
  const hideOpenIn =
    !extendedConnectors?.length ||
    (version && historyVisible) ||
    extendedConnectors?.every(item => !item.share_link);

  const navigate = useNavigate();

  const [FLAGS] = useFlags();

  //Have editing rights & & have published business lines
  const showPublishManageMenu = !isReadOnly && hasPublish;

  const { ready, inited } = useIsPublishRecordReady({
    type: IntelligenceType.Bot,
    intelligenceId: botId,
    spaceId,
    enable:
      showPublishManageMenu &&
      // Support soon, so stay tuned.
      FLAGS['bot.studio.publish_management'] &&
      !IS_OPEN_SOURCE,
  });

  if (!showPublishManageMenu && hideOpenIn) {
    return null;
  }

  const publishMenuItems = [
    {
      label: I18n.t('analytics_page_title'),
      to: `/space/${spaceId}/publish/agent/${botId}?tab=analysis`,
    },
    {
      label: I18n.t('release_management_trace'),
      to: `/space/${spaceId}/publish/agent/${botId}?tab=logs`,
    },
    {
      label: I18n.t('release_management_trigger'),
      to: `/space/${spaceId}/publish/agent/${botId}?tab=triggers`,
    },
  ];

  return (
    <Dropdown
      render={
        <Dropdown.Menu mode="menu">
          {/* Support soon, so stay tuned. */}
          {showPublishManageMenu &&
          FLAGS['bot.studio.publish_management'] &&
          !IS_OPEN_SOURCE
            ? publishMenuItems.map(item => {
                const menuItem = (
                  <Dropdown.Item
                    disabled={!ready}
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                  </Dropdown.Item>
                );
                return ready || !inited ? (
                  menuItem
                ) : (
                  <Tooltip content={I18n.t('release_management_generating')}>
                    <div>{menuItem}</div>
                  </Tooltip>
                );
              })
            : null}
          {hideOpenIn ? null : (
            <>
              {/* Support soon, so stay tuned. */}
              {showPublishManageMenu &&
              FLAGS['bot.studio.publish_management'] &&
              !IS_OPEN_SOURCE ? (
                <Dropdown.Divider />
              ) : null}
              <Dropdown
                render={
                  <LinkMenu
                    connectors={extendedConnectors?.filter(
                      item =>
                        item.share_link &&
                        // Read-only status Only display normal release channels
                        (!isReadOnly ||
                          item.connector_status ===
                            ConnectorDynamicStatus.Normal),
                    )}
                    renderMorePlatform={!isReadOnly && !!hasMorePlatform}
                    isReadOnly={isReadOnly}
                  />
                }
              >
                <Dropdown.Item>
                  <div className="w-full flex items-center">
                    <div className="flex-1">
                      {I18n.t('release_management_openin')}
                    </div>
                    <IconCozArrowRightFill />
                  </div>
                </Dropdown.Item>
              </Dropdown>
            </>
          )}
        </Dropdown.Menu>
      }
    >
      <IconButton icon={<IconCozMore />} />
    </Dropdown>
  );
};
