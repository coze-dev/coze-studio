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

import dayjs from 'dayjs';

let getIsIPadCache: boolean | undefined;
/**
 * Code provided by gpt-4
 */
export const getIsIPad = () => {
  if (typeof getIsIPadCache === 'undefined') {
    const { userAgent } = navigator;
    const isIPadDevice = /iPad/.test(userAgent);
    const isIPadOS =
      userAgent.includes('Macintosh') &&
      'ontouchstart' in document.documentElement;

    getIsIPadCache = isIPadDevice || isIPadOS;
  }

  return getIsIPadCache;
};

/* Timestamp converts text and omits the year or date*/
export const formatOmittedDateTime = time => {
  if (!time) {
    return '';
  }

  const day = dayjs(time);
  const today = dayjs();

  let formatStr: string;

  if (!today.isSame(day, 'year')) {
    // Not the year, show the year
    formatStr = 'YYYY-MM-DD HH:mm';
  } else if (!today.isSame(day, 'day')) {
    // Not the day, the display date.
    formatStr = 'MM-DD HH:mm';
  } else {
    // Show time only on the day
    formatStr = 'HH:mm';
  }

  return day.format(formatStr);
};

/** wait */
export const wait = (ms: number) =>
  new Promise(r => {
    setTimeout(r, ms);
  });

import { reporter as infraReporter } from '@coze-arch/logger';

/**
 * The slardar reporting instance used by the process
 */
export const reporter = infraReporter.createReporterWithPreset({
  namespace: 'workflow',
});
