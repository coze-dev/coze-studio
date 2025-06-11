import { logger, reporter, getSlardarInstance } from '@coze-arch/logger';

enum CustomPerfMarkNames {
  RouteChange = 'route_change',
}

export enum PerfMetricNames {
  TTI = 'coze_custom_tti',
  TTI_HOT = 'coze_custom_tti_hot',
}

const fcpEntryName = 'first-contentful-paint';

const lastRouteNameRef: {
  name: string;
  reportScene: Array<string>;
} = { name: '', reportScene: [] };

export const REPORT_TTI_DEFAULT_SCENE = 'init';

export const reportTti = (extra?: Record<string, string>, scene?: string) => {
  const sceneKey = scene ?? REPORT_TTI_DEFAULT_SCENE;
  const value = performance.now();
  const routeChangeEntries = performance.getEntriesByName(
    CustomPerfMarkNames.RouteChange,
  ) as PerformanceMark[];
  const lastRoute = routeChangeEntries.at(-1);
  // 当前页面已经上报过
  if (
    lastRoute?.detail?.location?.pathname &&
    lastRoute.detail.location.pathname === lastRouteNameRef.name &&
    lastRouteNameRef.reportScene.includes(sceneKey)
  ) {
    return;
  }
  if (document.visibilityState === 'hidden') {
    // 页签处于后台，FCP / TTI 均不准确，放弃上报
    reporter.info({
      message: 'page_hidden_on_tti_report',
      namespace: 'performance',
    });
    return;
  }
  lastRouteNameRef.name = lastRoute?.detail?.location?.pathname;
  lastRouteNameRef.reportScene.push(sceneKey);

  // 首个路由视为冷启动，否则视为热启动，因为预期 TTI 时间差异会比较大，这里上报到不同的埋点上
  if (routeChangeEntries.length > 1) {
    // startTime 是相对于 performance.timeOrigin 的一个偏移量
    executeSendTtiHot(value - (lastRoute?.startTime ?? 0), extra);
    return;
  }
  const fcp = performance.getEntriesByName(fcpEntryName)[0];
  if (fcp) {
    // 已发生 FCP，比较 TTI 与 FCP 时间，取耗时更长的一个
    executeSendTti(value > fcp.startTime ? value : fcp.startTime, {
      ...extra,
      fcpTime: `${fcp.startTime}`,
    });
  } else if (window.PerformanceObserver) {
    // 还未发生 FCP 时，监听 FCP 作为 TTI 上报
    const observer = new PerformanceObserver(list => {
      const fcpEntry = list.getEntriesByName(fcpEntryName)[0];
      if (fcpEntry) {
        executeSendTti(fcpEntry.startTime, {
          ...extra,
          fcpTime: `${fcpEntry.startTime}`,
        });
        observer.disconnect();
      }
    });
    try {
      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      // 处理兼容性问题 Failed to execute 'observe' on 'PerformanceObserver': required member entryTypes is undefined.
      if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
        try {
          observer.observe({ entryTypes: ['paint'] });
        } catch (innerError) {
          reporter.info({
            message: (innerError as Error).message,
            namespace: 'performance',
          });
        }
      }
      reporter.info({
        message: (error as Error).message,
        namespace: 'performance',
      });
    }
  }
};

const executeSendTti = (value: number, extra?: Record<string, string>) => {
  getSlardarInstance()?.('sendCustomPerfMetric', {
    value,
    name: PerfMetricNames.TTI,
    /** 性能指标类型， perf => 传统性能, spa => SPA 性能, mf => 微前端性能 */
    type: 'perf',
    extra: {
      // TODO 公共参数
      ...extra,
    },
  });

  logger.info({
    message: 'coze_custom_tti',
    meta: { value, extra },
  });
};

const executeSendTtiHot = (value: number, extra?: Record<string, string>) => {
  getSlardarInstance()?.('sendCustomPerfMetric', {
    value,
    name: PerfMetricNames.TTI_HOT,
    /** 性能指标类型， perf => 传统性能, spa => SPA 性能, mf => 微前端性能 */
    type: 'perf',
    extra: {
      // TODO 公共参数
      ...extra,
    },
  });

  logger.info({
    message: 'coze_custom_tti_hot',
    meta: { value, extra },
  });
};
