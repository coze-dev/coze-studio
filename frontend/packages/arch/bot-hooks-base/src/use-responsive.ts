import { useMediaQuery, ScreenRange } from '@coze-arch/responsive-kit';

import { useRouteConfig } from './use-route-config';

export const useIsResponsiveByRouteConfig = () => {
  const { responsive } = useRouteConfig();
  const shouldResponsive = responsive !== undefined;
  const { rangeMax, include = false } =
    responsive === true
      ? { rangeMax: ScreenRange.LG, include: false }
      : responsive || {};
  const matches = useMediaQuery(
    include
      ? {
          rangeMax,
        }
      : {
          rangeMin: rangeMax,
        },
  );
  const isResponsive = include ? matches : !matches;
  return shouldResponsive && isResponsive;
};
