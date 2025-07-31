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

import JSONBig from 'json-bigint';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';

interface TypeSafeJSONParseOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emptyValue?: any;
  needReport?: boolean;
  enableBigInt?: boolean;
}

export const typeSafeJSONParse = (
  v: unknown,
  options?: TypeSafeJSONParseOptions,
): unknown => {
  if (typeof v === 'object') {
    return v;
  }
  try {
    if (options?.enableBigInt) {
      return JSONBig.parse(String(v));
    }
    return JSON.parse(String(v));
  } catch (e) {
    // log parsing
    if (options?.needReport) {
      reporter.errorEvent({
        error: e as Error,
        eventName: REPORT_EVENTS.parseJSON,
      });
    }
    return options?.emptyValue;
  }
};
