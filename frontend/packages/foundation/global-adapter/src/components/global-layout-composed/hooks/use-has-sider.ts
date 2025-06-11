import { useLocation } from 'react-router-dom';

import { useIsLogined } from '@coze-arch/foundation-sdk';
import { useRouteConfig } from '@coze-arch/bot-hooks';

export const useHasSider = () => {
  const config = useRouteConfig();
  const location = useLocation();
  const isLogined = useIsLogined();
  const queryParams = new URLSearchParams(location.search);
  const pageMode = queryParams.get('page_mode');

  // 优先使用 page_mode 参数判断是否为全屏模式
  if (config.pageModeByQuery && pageMode === 'modal') {
    return false;
  }

  const notCheckLoginPage =
    (config.requireAuth && config.requireAuthOptional) || !config.requireAuth;
  // 未登录时也可访问的页面
  if (config.hasSider && notCheckLoginPage && !isLogined) {
    return false;
  }

  return !!config.hasSider;
};
