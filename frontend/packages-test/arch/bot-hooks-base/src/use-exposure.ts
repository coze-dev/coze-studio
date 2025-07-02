import { useEffect, useRef } from 'react';

import { type BasicTarget } from 'ahooks/lib/utils/domTarget';
import { type Options } from 'ahooks/lib/useInViewport';
import { useInViewport } from 'ahooks';
import { type EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

export interface UseExposureParams {
  /** 曝光元素 */
  target: BasicTarget;
  /** Intersection observer参数 */
  options?: Options;
  /** 上报事件名称 */
  eventName?: EVENT_NAMES;
  /** 上报参数 */
  reportParams?: Record<string, unknown>;
  /** 是否进行上报 默认为true */
  needReport?: boolean;
  isReportOnce?: boolean;
}

/** 曝光埋点上报 */
export const useExposure = ({
  target,
  options,
  eventName,
  reportParams,
  needReport = true,
  isReportOnce = false,
}: UseExposureParams) => {
  const [isInView] = useInViewport(target, options);
  const refHasReport = useRef(false);

  useEffect(() => {
    if (isReportOnce && refHasReport.current) {
      //已上报过数据，就直接返回
      return;
    }
    if (needReport && isInView) {
      sendTeaEvent(eventName, reportParams);
      refHasReport.current = true;
    }
  }, [needReport, isInView, isReportOnce]);
};
