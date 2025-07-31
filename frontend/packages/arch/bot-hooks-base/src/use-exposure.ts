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

import { useEffect, useRef } from 'react';

import { type BasicTarget } from 'ahooks/lib/utils/domTarget';
import { type Options } from 'ahooks/lib/useInViewport';
import { useInViewport } from 'ahooks';
import { type EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

export interface UseExposureParams {
  /** Exposure element */
  target: BasicTarget;
  /** Intersection observer parameters */
  options?: Options;
  /** event name reported */
  eventName?: EVENT_NAMES;
  /** reporting parameters */
  reportParams?: Record<string, unknown>;
  /** Whether to report, the default is true */
  needReport?: boolean;
  isReportOnce?: boolean;
}

/** Exposure event tracking report */
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
      //If the data has been reported, please return directly.
      return;
    }
    if (needReport && isInView) {
      sendTeaEvent(eventName, reportParams);
      refHasReport.current = true;
    }
  }, [needReport, isInView, isReportOnce]);
};
