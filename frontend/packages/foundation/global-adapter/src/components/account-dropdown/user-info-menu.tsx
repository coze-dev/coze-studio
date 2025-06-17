import { useUserInfo, useUserLabel } from '@coze-arch/foundation-sdk';
import {
  CozAvatar,
  Badge,
  Dropdown,
  Space,
  Typography,
  Tooltip,
} from '@coze-arch/coze-design';

const ellipsis = {
  showTooltip: true,
};

export const UserInfoMenu = () => {
  const userInfo = useUserInfo();
  const userLabel = useUserLabel();

  if (!userInfo) {
    return null;
  }

  const userUniqueName = userInfo?.app_user_info?.user_unique_name;

  return (
    <Dropdown.Item className="!h-fit">
      <div className="flex justify-between items-center w-full">
        <Space spacing={8} className="shrink grow overflow-hidden">
          {
            <Badge
              position="rightBottom"
              countStyle={{
                right: 6,
                bottom: 6,
              }}
              count={
                userLabel?.icon_url ? (
                  <Tooltip
                    showArrow
                    position="right"
                    content={userLabel?.label_name}
                    trigger={userLabel?.label_name ? 'hover' : 'custom'}
                  >
                    <div className="bg-white rounded-full w-[16px] h-[16px] flex items-center justify-center">
                      <CozAvatar
                        src={userLabel?.icon_url}
                        className="w-[12px] h-[12px] rounded-full"
                        type="person"
                        onClick={event => {
                          if (userLabel?.jump_link) {
                            event?.preventDefault();
                            event?.stopPropagation();
                            window.open(userLabel?.jump_link, '_blank');
                          }
                        }}
                      />
                    </div>
                  </Tooltip>
                ) : null
              }
              className="shrink-0"
            >
              <CozAvatar
                src={userInfo.avatar_url}
                className="w-[32px] h-[32px] rounded-full"
                type="person"
              />
            </Badge>
          }
          {
            <div className="flex-1 text-[14px] leading-[20px] overflow-hidden sp">
              <Typography.Text
                className="coz-fg-primary font-[500]"
                ellipsis={ellipsis}
              >
                {userInfo.name}
              </Typography.Text>
              <Typography.Text className="coz-fg-secondary" ellipsis={ellipsis}>
                {userUniqueName ? '@' : ''}
                {userUniqueName}
              </Typography.Text>
            </div>
          }
        </Space>
      </div>
    </Dropdown.Item>
  );
};
