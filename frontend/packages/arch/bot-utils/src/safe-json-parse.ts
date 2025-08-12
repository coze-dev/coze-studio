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

import { REPORT_EVENTS } from '@coze-arch/report-events';
import { logger, reporter } from '@coze-arch/logger';

/**
 * @Deprecated This is actually unsafe, please use typeSafeJSONParse instead
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeJSONParse: (v: any, emptyValue?: any) => any = (
  v,
  emptyValue,
) => {
  try {
    const json = JSON.parse(v);
    return json;
  } catch (e) {
    logger.persist.error({
      error: e as Error,
      eventName: REPORT_EVENTS.parseJSON,
      message: 'parse json fail',
    });
    return emptyValue ?? void 0;
  }
};

export const typeSafeJSONParse = (v: unknown): unknown => {
  if (typeof v === 'object') {
    return v;
  }
  try {
    return JSON.parse(String(v));
  } catch (e) {
    reporter.errorEvent({
      error: e as Error,
      eventName: REPORT_EVENTS.parseJSON,
    });
  }
};
