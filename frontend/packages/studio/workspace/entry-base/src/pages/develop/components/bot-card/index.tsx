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

/* eslint @coze-arch/max-line-per-function: ["error", {"max": 500}] */
/* eslint-disable complexity */
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, type ReactNode } from 'react';

import { cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import { FavoriteIconBtn } from '@coze-community/components';
import { ProductEntityType } from '@coze-arch/idl/product_api';
import {
  type IntelligenceBasicInfo,
  type IntelligenceData,
  IntelligenceStatus,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFillPalette,
  IconCozMore,
  IconCozStarFill,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { Avatar, IconButton, Menu, Tooltip } from '@coze-arch/coze-design';
import { formatDate, getFormatDateType } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { ConnectorDynamicStatus } from '@coze-arch/bot-api/developer_api';

import { Creator } from '@/components/creator';

import Name from './name';
import { type AgentCopySuccessCallback, MenuCopyBot } from './menu-actions';
import { IntelligenceTag } from './intelligence-tag';
import Description from './description';
import { CopyProcessMask } from './copy-process-mask';

export interface BotCardProps {
  intelligenceInfo: IntelligenceData;
  timePrefixType?: 'recentOpen' | 'publish' | 'edit';
  /**
   * Returning true interrupts the default jump behavior
   */
  onClick?: (() => true) | (() => void);
  onDelete?: (param: {
    name: string;
    id: string;
    type: IntelligenceType;
  }) => void;
  onCopyProject?: (basicInfo: IntelligenceBasicInfo) => void;
  onCopyAgent?: AgentCopySuccessCallback;
  onUpdateIntelligenceInfo: (info: IntelligenceData) => void;
  onRetryCopy: (basicInfo: IntelligenceBasicInfo) => void;
  onCancelCopyAfterFailed: (basicInfo: IntelligenceBasicInfo) => void;
  extraMenu?: ReactNode;
  headerExtra?: ReactNode;
  statusExtra?: ReactNode;
  actionsMenuVisible?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const BotCard: React.FC<BotCardProps> = ({
  intelligenceInfo,
  timePrefixType,
  onClick,
  onDelete,
  onCopyProject,
  onCopyAgent,
  onUpdateIntelligenceInfo,
  onCancelCopyAfterFailed,
  onRetryCopy,
  extraMenu,
  actionsMenuVisible = true,
  headerExtra,
  statusExtra,
}) => {
  const navigate = useNavigate();

  const {
    basic_info,
    type,
    permission_info: { in_collaboration, can_delete } = {},
    publish_info: { publish_time, connectors, has_published } = {},
    other_info: { recently_open_time } = {},
    owner_info,
    favorite_info: { is_fav } = {},
  } = intelligenceInfo;

  const { id, name, icon_url, space_id, description, update_time, status } =
    basic_info ?? {};

  const hideOperation = useSpaceStore(store => store.space.hide_operation);

  const renderPublishStatusIcon = () => {
    if (!has_published) {
      return null;
    }
    if (!connectors?.length) {
      return (
        <IconCozCheckMarkCircleFillPalette className="text-xxl coz-fg-hglt-green flex-shrink-0" />
      );
    }
    const isSomeConnectorsFailed = connectors.some(
      item => item?.connector_status !== ConnectorDynamicStatus.Normal,
    );
    if (isSomeConnectorsFailed) {
      return (
        <IconCozWarningCircleFill className="text-xxl coz-fg-hglt-yellow flex-shrink-0" />
      );
    }
    return (
      <IconCozCheckMarkCircleFillPalette className="text-xxl coz-fg-hglt-green flex-shrink-0" />
    );
  };

  if (!id || !space_id) {
    // The id and space id are necessary for the bot card. Here are the constraints on the ts type
    throw Error('No botID or no spaceID which are necessary');
  }

  const isBanned = status === IntelligenceStatus.Banned;
  const isAgent = type === IntelligenceType.Bot;
  const isProject = type === IntelligenceType.Project;

  const timePrefix = useMemo(() => {
    switch (timePrefixType) {
      case 'recentOpen':
        return I18n.t('develop_list_rank_tag_opened');
      case 'publish':
        return I18n.t('bot_list_rank_tag_published');
      case 'edit':
        return in_collaboration
          ? I18n.t('devops_publish_multibranch_RecentSubmit')
          : I18n.t('bot_list_rank_tag_edited');
      default:
    }
  }, [timePrefixType, in_collaboration]);

  const time = useMemo(() => {
    let timestamp: string | undefined;

    switch (timePrefixType) {
      case 'recentOpen':
        timestamp = recently_open_time;
        break;
      case 'publish':
        timestamp = publish_time;
        break;
      case 'edit':
        timestamp = update_time;
        break;
      default:
    }

    return formatDate(Number(timestamp), getFormatDateType(Number(timestamp)));
  }, [timePrefixType, publish_time, update_time, recently_open_time]);

  // Whether to display the card layering operation button
  const [showActions, setShowActions] = useState(false);
  // Whether to display the menu menu, there are other components actively calling here, which need to be controlled
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div
        className={classNames([
          'flex-grow h-[158px] min-w-[280px]',
          'rounded-[6px] border-solid	border-[1px] ',
          'relative',
          'overflow-hidden transition duration-150 ease-out hover:shadow-[0_6px_8px_0_rgba(28,31,35,6%)]',
          'coz-stroke-primary coz-mg-card',
        ])}
      >
        <div
          className="h-full w-full cursor-pointer flex flex-col gap-[12px] px-[16px] py-[16px]"
          onClick={() => {
            if (onClick?.()) {
              return;
            }
            if (isBanned) {
              return;
            }
            if (isAgent) {
              navigate(`/space/${space_id}/bot/${id}`);
              return;
            }
            if (isProject) {
              navigate(`/space/${space_id}/project-ide/${id}`);
              return;
            }
          }}
          onMouseEnter={() => {
            setShowActions(true);
          }}
          onMouseLeave={() => {
            setShowActions(false);
          }}
          data-testid="bot-list-page.bot-card"
        >
          {/* Display migration failure status icon */}
          {statusExtra}

          {/* Bot basic information */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-[4px] w-[calc(100%-76px)]">
              <div className="flex items-center gap-[4px]">
                <Name name={name} />
                {isBanned ? (
                  // If it fails, display the failure icon
                  <IconCozWarningCircleFill className="text-xxl coz-fg-hglt-red flex-shrink-0" />
                ) : (
                  <>
                    {/* Publish status icon */}
                    {renderPublishStatusIcon()}
                    {headerExtra}
                  </>
                )}
              </div>

              <Description description={description} />
            </div>
            <Avatar
              className="w-[64px] h-[64px] rounded-[10px] flex-shrink-0 ml-[12px]"
              shape="square"
              src={icon_url}
            />
          </div>

          {/* Projects/Agents */}
          <IntelligenceTag intelligenceType={type} />

          {/* Bot author information */}
          {!!owner_info && (
            <Creator
              avatar={owner_info.avatar_url}
              name={owner_info.nickname}
              extra={`${timePrefix} ${time}`}
            />
          )}

          {/* Actions Floating layer action When the floating layer appears, there is a white mask below */}
          {!hideOperation ? (
            <>
              {showActions && actionsMenuVisible ? (
                <div
                  className="absolute bottom-[16px] right-[16px] w-[100px] h-[16px] "
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 21.38%)',
                  }}
                ></div>
              ) : null}
              <div
                className="absolute bottom-[16px] right-[16px] flex gap-[4px]"
                onClick={e => {
                  // Prevent click events from bubbling to the outermost layer of the card
                  e.stopPropagation();
                }}
              >
                {showActions && actionsMenuVisible ? (
                  <>
                    {!isBanned ? (
                      // Favorite bot
                      <FavoriteIconBtn
                        useButton
                        isVisible
                        entityId={id}
                        entityType={
                          type === IntelligenceType.Bot
                            ? ProductEntityType.Bot
                            : ProductEntityType.Project
                        }
                        isFavorite={is_fav}
                        onFavoriteStateChange={isFav => {
                          const clonedInfo = cloneDeep(intelligenceInfo);
                          clonedInfo.favorite_info = {
                            ...(clonedInfo.favorite_info ?? {}),
                            is_fav: isFav,
                          };
                          onUpdateIntelligenceInfo(clonedInfo);
                        }}
                      />
                    ) : null}
                    {/* dropdown menu */}
                    <Menu
                      keepDOM
                      className="w-fit mt-4px mb-4px"
                      position="bottomRight"
                      trigger="custom"
                      visible={showMenu}
                      render={
                        <Menu.SubMenu mode="menu">
                          {/* Copy bot */}
                          {isAgent ? (
                            <MenuCopyBot
                              id={id}
                              spaceID={space_id}
                              disabled={isBanned}
                              onCopySuccess={onCopyAgent}
                              onClose={() => setShowActions(false)}
                            />
                          ) : null}
                          {isProject ? (
                            <Tooltip content={I18n.t('coze_copy_to_tips_1')}>
                              <Menu.Item
                                onClick={() => {
                                  if (!basic_info) {
                                    return;
                                  }
                                  onCopyProject?.(basic_info);
                                }}
                                data-testid="bot-card.copy"
                              >
                                {I18n.t('project_ide_create_duplicate')}
                              </Menu.Item>
                            </Tooltip>
                          ) : null}
                          {extraMenu}
                          {/* Delete bot */}
                          <Tooltip
                            position="left"
                            trigger={can_delete ? 'custom' : 'hover'}
                            content={I18n.t(
                              'project_delete_permission_tooltips',
                            )}
                          >
                            <Menu.Item
                              type="danger"
                              disabled={!can_delete}
                              onClick={() => {
                                if (!name || !type) {
                                  return;
                                }
                                onDelete?.({ name, id, type });
                              }}
                            >
                              <span>{I18n.t('Delete')}</span>
                            </Menu.Item>
                          </Tooltip>
                        </Menu.SubMenu>
                      }
                    >
                      <IconButton
                        className="rotate-90"
                        data-testid="bot-card.icon-more-button"
                        color="primary"
                        size="default"
                        icon={<IconCozMore />}
                        onClick={() => setShowMenu(true)}
                      />
                    </Menu>
                  </>
                ) : is_fav && !isBanned ? (
                  // If the bot has already been collected, display the icon when not hovering.
                  <IconButton
                    className="!pt-[20px]"
                    color="secondary"
                    icon={<IconCozStarFill className="coz-fg-color-yellow" />}
                  ></IconButton>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
        {basic_info ? (
          <CopyProcessMask
            intelligenceBasicInfo={basic_info}
            onRetry={changedStatus => {
              onRetryCopy({
                ...basic_info,
                status: changedStatus,
              });
            }}
            onCancelCopyAfterFailed={changedStatus => {
              onCancelCopyAfterFailed({
                ...basic_info,
                status: changedStatus,
              });
            }}
          />
        ) : null}
      </div>
    </>
  );
};
