import { type FC } from 'react';

import classNames from 'classnames';
import { reporter } from '@coze-arch/logger';
import {
  type IntelligenceData,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  ProductEntityType,
  type FavoriteProductResponse,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';
import { cozeMitt } from '@coze-common/coze-mitt';
import { CustomError } from '@coze-arch/bot-error';
import { IconCozMore } from '@coze/coze-design/icons';
import { Space, Avatar, Typography, Popover, Button } from '@coze/coze-design';

const getSubPath = (type: IntelligenceType | undefined) => {
  if (type === IntelligenceType.Project) {
    return 'project-ide';
  }
  if (type === IntelligenceType.Bot) {
    //跳转至 Bot编辑页，后续会改成新的URL/space/:spaceId/agent/:agentId
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
  // 取消收藏
  const clickToUnfavorite = async () => {
    try {
      const res: FavoriteProductResponse =
        await ProductApi.PublicFavoriteProduct({
          entity_type: ProductEntityType.Bot,
          is_cancel: true,
          entity_id: id,
        });
      if (res.code === 0) {
        // 取消收藏成功，刷新收藏列表
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
        //跳转至 Bot编辑页，后续会改成新的URL/space/:spaceId/agent/:agentId
        window.open(getIntelligenceNavigateUrl({ basic_info, type }), '_blank');
      }}
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
