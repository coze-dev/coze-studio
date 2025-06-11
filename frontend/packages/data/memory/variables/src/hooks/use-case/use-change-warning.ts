import { useState } from 'react';

import { useHiddenSession } from '@/hooks/use-case/use-hidden-session';

export const useChangeWarning = () => {
  const [isShowBanner, setIsShowBanner] = useState(false);
  const { isSessionHidden, hideSession } = useHiddenSession(
    'variable_config_change_banner_remind',
  );

  const showBanner = () => {
    setIsShowBanner(true);
  };

  const hideBanner = () => {
    setIsShowBanner(false);
  };

  const hideBannerForever = () => {
    hideSession();
    setIsShowBanner(false);
  };

  return {
    isShowBanner: isShowBanner && !isSessionHidden,
    showBanner,
    hideBanner,
    hideBannerForever,
  };
};
