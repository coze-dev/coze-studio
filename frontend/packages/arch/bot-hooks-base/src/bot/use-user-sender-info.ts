import { userStoreService } from '@coze-studio/user-store';
import { type UserSenderInfo } from '@coze-common/chat-area';

export const useUserSenderInfo = () => {
  const userLabel = userStoreService.useUserLabel();
  const userInfo = userStoreService.useUserInfo();
  if (!userInfo) {
    return null;
  }

  const userSenderInfo: UserSenderInfo = {
    url: userInfo?.avatar_url || '',
    nickname: userInfo?.name || '',
    id: userInfo?.user_id_str || '',
    userUniqueName: userInfo?.app_user_info?.user_unique_name || '',
    userLabel,
  };

  return userSenderInfo;
};
