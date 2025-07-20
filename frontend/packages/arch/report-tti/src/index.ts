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
 
import { useEffect } from 'react';

import {
  reportTti,
  REPORT_TTI_DEFAULT_SCENE,
} from './utils/custom-perf-metric';

export interface ReportTtiParams {
  isLive: boolean;
  extra?: Record<string, string>;
  scene?: string; // 一个页面默认只上报一次tti，设置不同的scene可上报多次
}

export const useReportTti = ({
  isLive,
  extra,
  scene = REPORT_TTI_DEFAULT_SCENE,
}: ReportTtiParams) => {
  useEffect(() => {
    if (isLive) {
      // TODO useEffect 与真实 DOM 渲染之间会有 gap，需要考虑如何抹平差异
      // settimeout 在网页后台会挂起，导致 TTI 严重不准
      reportTti(extra, scene);
    }
  }, [isLive]);
};
