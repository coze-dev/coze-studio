import { type FC } from 'react';

import cls from 'classnames';
import { AvatarName } from '@coze-studio/components';
import { type explore } from '@coze-studio/api-schema';
import { type UserInfo as ProductUserInfo } from '@coze-arch/bot-api/product_api';
import { Typography } from '@coze-arch/coze-design';

type UserInfo = explore.product_common.UserInfo | ProductUserInfo;
interface TemplateCardBodyProps {
  title?: string;
  description?: string;
  userInfo?: UserInfo;
  descClassName?: string;
  renderCardTag?: () => React.ReactNode;
  renderDescBottomSlot?: () => React.ReactNode;
}
export const CardInfo: FC<TemplateCardBodyProps> = ({
  title,
  description,
  userInfo,
  renderCardTag,
  descClassName,
  renderDescBottomSlot,
}) => (
  <div className={cls('mt-[8px] px-[4px] grow', 'flex flex-col')}>
    <div className="flex items-center gap-[8px] overflow-hidden">
      <Typography.Text
        className="!font-medium text-[16px] leading-[22px] coz-fg-primary !max-w-[180px]"
        ellipsis={{ showTooltip: true, rows: 1 }}
      >
        {title}
      </Typography.Text>
      {renderCardTag?.()}
    </div>

    <AvatarName
      className="mt-[4px]"
      avatar={userInfo?.avatar_url}
      name={userInfo?.name}
      username={userInfo?.user_name}
      label={{
        name: userInfo?.user_label?.label_name,
        icon: userInfo?.user_label?.icon_url,
        href: userInfo?.user_label?.jump_link,
      }}
    />

    <div
      className={cls(
        'mt-[8px] flex flex-col justify-between grow',
        descClassName,
      )}
    >
      <Typography.Text
        className="min-h-[40px] leading-[20px] coz-fg-secondary"
        ellipsis={{ showTooltip: true, rows: 2 }}
      >
        {description}
      </Typography.Text>
      {renderDescBottomSlot?.()}
    </div>
  </div>
);
