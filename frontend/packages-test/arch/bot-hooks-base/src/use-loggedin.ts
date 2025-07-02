import { userStoreService } from '@coze-studio/user-store';

/**
 * 判断当前用户是否处于登陆状态
 */
export const useLoggedIn = () => userStoreService.useIsLogined();
