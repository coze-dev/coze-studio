import { useEffect } from 'react';

import { isMobile, setMobileBody, setPCBody } from '@coze-arch/bot-utils';
import {
  useIsResponsive,
  useIsResponsiveByRouteConfig,
  useRouteConfig,
} from '@coze-arch/bot-hooks';

import { useSignMobileStore } from '../../store';
import { useMobileTips } from '../../hooks';
import { useGlobalLayoutContext } from './context';

export const useLayoutResponsive = () => {
  const { mobileTips, setMobileTips } = useSignMobileStore();
  const { node: mobileTipsModal, open: openMobileTipsModal } = useMobileTips();
  const config = useRouteConfig();
  const isResponsiveOld = useIsResponsive();
  const isResponsiveByRouteConfig = useIsResponsiveByRouteConfig();
  const isResponsive = isResponsiveOld || isResponsiveByRouteConfig;

  useEffect(() => {
    if (config.showMobileTips) {
      if (!mobileTips && isMobile()) {
        openMobileTipsModal(); // 不适配移动端弹窗提示
        setMobileTips(true);
      }

      if (isResponsive) {
        setMobileBody();
      } else {
        setPCBody();
      }
    }
  }, [config.showMobileTips, isResponsive]);
  return {
    isResponsive,
    mobileTipsModal: config.showMobileTips ? mobileTipsModal : null,
  };
};

export const useOpenGlobalLayoutSideSheet = () => {
  const { setSideSheetVisible } = useGlobalLayoutContext();
  return () => {
    setSideSheetVisible(true);
  };
};
