import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { logger } from '@coze-arch/logger';

export enum CustomPerfMarkNames {
  RouteChange = 'route_change',
}

export const useTrackRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    performance.mark(CustomPerfMarkNames.RouteChange, {
      detail: {
        location,
      },
    });
    logger.info({
      message: 'location change',
      meta: { location },
    });
  }, [location.pathname]);
};
