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

import classNames from 'classnames';
import { cozeMitt } from '@coze-common/coze-mitt';
import { reporter } from '@coze-arch/logger';
import {
  type IntelligenceData,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import {
  Space,
  Avatar,
  Typography,
  Popover,
  Button,
} from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { CustomError } from '@coze-arch/bot-error';
import {
  ProductEntityType,
  type FavoriteProductResponse,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

const getSubPath = (type: IntelligenceType | undefined) => {
  if (type === IntelligenceType.Project) {
    return 'project-ide';
  }
  if (type === IntelligenceType.Bot) {
    //Jump to the Bot edit page, which will be changed to a new URL/space/: spaceId/agent/: agentId later.
    return 'bot';
  }
  return '';
};

const getIntelligenceNavigateUrl = ({
  basic_info = {},
  type,
}: Pick<IntelligenceData, 'basic_info' | 'type'>) => {
  const { space_id, id } = basic_info;
  return `/space/${space_id}/${getSubPath(type)}/${id}`;
};

export const FavoritesListItem: FC<IntelligenceData> = ({
  basic_info = {},
  type,
}) => {
  // Cancel Favorite
  const clickToUnfavorite = async () => {
    try {
      const res: FavoriteProductResponse =
        await ProductApi.PublicFavoriteProduct({
          entity_type:
            type === IntelligenceType.Project
              ? ProductEntityType.Project
              : ProductEntityType.Bot,
          is_cancel: true,
          entity_id: id,
        });
      if (res.code === 0) {
        // Cancel the collection successfully, refresh the collection list
        cozeMitt.emit('refreshFavList', {
          id,
          numDelta: -1,
          emitPosition: 'favorites-list-item',
        });
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      reporter.errorEvent({
        eventName: 'sub_menu_unfavorite_error',
        error: new CustomError(
          'sub_menu_unfavorite_error',
          (error as Error).message,
        ),
      });
    }
  };
  const { icon_url, name, space_id, id } = basic_info;
  return (
    <div
      className={classNames(
        'group',
        'h-[32px] w-full rounded-[8px] cursor-pointer hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
      )}
      onClick={() => {
        if (!space_id || !id) {
          return;
        }
        sendTeaEvent(EVENT_NAMES.coze_space_sidenavi_ck, {
          item: id,
          category: 'space_favourite',
          navi_type: 'second',
          need_login: true,
          have_access: true,
        });
        //Jump to the Bot edit page, which will be changed to a new URL/space/: spaceId/agent/: agentId later.
        window.open(getIntelligenceNavigateUrl({ basic_info, type }), '_blank');
      }}
      data-testid="workspace.favorites.list.item"
    >
      <Space className="h-[32px] px-[8px] w-full" spacing={8}>
        <Avatar
          className="h-[16px] w-[16px] rounded-[4px] shrink-0"
          shape="square"
          src={icon_url}
        />
        <Typography.Text
          className="flex-1"
          ellipsis={{ showTooltip: true, rows: 1 }}
        >
          {name}
        </Typography.Text>
        <div
          onClick={e => {
            e.stopPropagation();
          }}
          className={classNames(
            'invisible opacity-0 group-hover:visible group-hover:opacity-100',
            'h-[16px] w-[16px]',
          )}
        >
          <Popover
            className="rounded-[8px]"
            position="bottomRight"
            mouseLeaveDelay={200}
            stopPropagation
            content={
              <div
                data-testid="workspace.favorites.list.item.popover"
                className="w-[112px] h-[32px] pl-[8px] rounded-[8px] flex items-center overflow-hidden relative cursor-pointer hover:coz-mg-secondary-hovered"
                onClick={clickToUnfavorite}
              >
                {I18n.t('navigation_workspace_favourites_cancle')}
              </div>
            }
          >
            <Button
              data-testid="workspace.favorites.list.item.popover.button"
              className={classNames('h-full w-full !flex')}
              size="mini"
              color="secondary"
              icon={<IconCozMore />}
            />
          </Popover>
        </div>
      </Space>
    </div>
  );
};
