import { useEffect } from 'react';

import { setMobileBody, setPCBody } from '@coze-arch/bot-utils';
import { useIsResponsiveByRouteConfig } from '@coze-arch/bot-hooks-base';

export const useSetResponsiveBodyStyle = () => {
  const isResponsive = useIsResponsiveByRouteConfig();
  useEffect(() => {
    if (isResponsive) {
      setMobileBody();
    } else {
      setPCBody();
    }
  }, [isResponsive]);
};
