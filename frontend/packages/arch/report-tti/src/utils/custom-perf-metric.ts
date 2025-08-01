/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  // The current page has been reported
  if (
    lastRoute?.detail?.location?.pathname &&
    lastRoute.detail.location.pathname === lastRouteNameRef.name &&
    lastRouteNameRef.reportScene.includes(sceneKey)
  ) {
    return;
  }
  if (document.visibilityState === 'hidden') {
    // The tab is in the background, the FCP/TTI is inaccurate, and the reporting is abandoned.
    reporter.info({
      message: 'page_hidden_on_tti_report',
      namespace: 'performance',
    });
    return;
  }
  lastRouteNameRef.name = lastRoute?.detail?.location?.pathname;
  lastRouteNameRef.reportScene.push(sceneKey);

  // The first route is regarded as a cold start, otherwise it is regarded as a hot start, because the expected TTI time difference will be relatively large, and it will be reported to different event tracking here.
  if (routeChangeEntries.length > 1) {
    // StartTime is an offset from the performance .timeOrigin
    executeSendTtiHot(value - (lastRoute?.startTime ?? 0), extra);
    return;
  }
  const fcp = performance.getEntriesByName(fcpEntryName)[0];
  if (fcp) {
    // FCP has occurred, compare TTI and FCP times, and take the longer one.
    executeSendTti(value > fcp.startTime ? value : fcp.startTime, {
      ...extra,
      fcpTime: `${fcp.startTime}`,
    });
  } else if (window.PerformanceObserver) {
    // When no FCP has occurred, monitor the FCP and report it as a TTI
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
      // Handling compatibility issues Failed to execute'observe 'on'PerformanceObserver': required member entryTypes is undefined.
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
    /** Performance index type, perf = > traditional performance, spa = > SPA performance, mf = > micro frontend performance */
    type: 'perf',
    extra: {
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
    /** Performance index type, perf = > traditional performance, spa = > SPA performance, mf = > micro frontend performance */
    type: 'perf',
    extra: {
      ...extra,
    },
  });

  logger.info({
    message: 'coze_custom_tti_hot',
    meta: { value, extra },
  });
};
