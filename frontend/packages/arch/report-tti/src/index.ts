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
  scene?: string; // A page only reports tti once by default, and different scenes can be reported multiple times.
}

export const useReportTti = ({
  isLive,
  extra,
  scene = REPORT_TTI_DEFAULT_SCENE,
}: ReportTtiParams) => {
  useEffect(() => {
    if (isLive) {
      // There will be a gap between TODO useEffect and real DOM rendering, you need to consider how to smooth the difference
      // SetTimeout hangs in the background of the page, causing TTI to be severely inaccurate
      reportTti(extra, scene);
    }
  }, [isLive]);
};
