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

      // TODO 梳理历史逻辑，统一迁移使用路由配置
      // 增加移动端适配判断，如果是移动端环境应通过setMobileBody取消min-width, min-height的设置（历史逻辑不动）
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
