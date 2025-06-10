import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { type ModeType } from '../types';
import { UI_BUILDER_URI } from '../constants';

export const useCurrentModeType = () => {
  const { pathname } = useLocation();

  const type: ModeType = useMemo(() => {
    if (pathname.includes(UI_BUILDER_URI.path.toString())) {
      return 'ui-builder';
    }
    return 'dev';
  }, [pathname]);

  return type;
};
