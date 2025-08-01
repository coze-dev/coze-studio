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

import { isNumber, isString, mapValues, omitBy, isNil } from 'lodash-es';
import type { SlardarInstance } from '@coze-studio/slardar-interface';

import {
  type CommonLogOptions,
  type LoggerReportClient,
  LogAction,
  LogLevel,
} from '../types';
import {
  toFlatPropertyMap,
  safeJson,
  getErrorRecord,
  getLogLevel,
  getSlardarLevel,
} from './utils';

/**
 * Converting meta to type
 * Metrics: Values that can be measured, that is, numerical values
 * - Dimension categories: classification, dimension, used for filtering, grouping
 *
 * @param meta
 * @returns
 */
function metaToMetricsCategories(meta?: Record<string, unknown>) {
  const metrics: Record<string, number> = {};
  const categories: Record<string, string> = {};
  for (const k in meta) {
    const val = meta[k];
    if (isNumber(val)) {
      metrics[k] = val;
    } else {
      categories[k] = isString(val) ? val : safeJson.stringify(val);
    }
  }

  return {
    metrics,
    categories,
  };
}

/**
 * Record<string, unknown> => Record<string, string | number>
 */
function normalizeExtra(record: Record<string, unknown>) {
  const result: Record<string, string | number> = {};
  for (const k in record) {
    const val = record[k];
    if (isNumber(val) || isString(val)) {
      result[k] = val;
    } else {
      result[k] = safeJson.stringify(val);
    }
  }
  return result;
}

export class SlardarReportClient implements LoggerReportClient {
  slardarInstance: SlardarInstance;

  constructor(slardarInstance: SlardarInstance) {
    // There may be multiple slardar versions in the business project, and the types of multiple versions are incompatible. There will be problems with the constrained version in the constructor = > release.
    this.slardarInstance = slardarInstance;

    if (!this.slardarInstance) {
      console.warn('expected slardarInstance but get undefined/null');
    }
  }

  send(options: CommonLogOptions) {
    if (!options.action?.includes(LogAction.PERSIST)) {
      // Non-persistent log, not reported
      return;
    }

    const { level, message, action, eventName, meta, error, ...rest } = options;

    // Slardar API：

    const resolveMeta = (inputs: Record<string, unknown>) =>
      toFlatPropertyMap(
        {
          ...rest,
          ...inputs,
          error: getErrorRecord(error),
          level: getLogLevel(level),
        },
        {
          maxDepth: 4,
        },
      );

    if (level === LogLevel.ERROR && meta?.reportJsError === true) {
      const { reportJsError, reactInfo, ...restMeta } = meta || {};
      const resolvedMeta = resolveMeta({
        ...restMeta,
        message,
        eventName,
      });

      // Report a JS exception
      this.slardarInstance?.(
        'captureException',
        error,
        omitBy(
          mapValues(resolvedMeta, (v: unknown) =>
            isString(v) ? v : safeJson.stringify(v),
          ),
          isNil,
        ),
        reactInfo as {
          version: string;
          componentStack: string;
        },
      );
    } else if (eventName) {
      const resolvedMeta = resolveMeta({
        ...meta,
      });

      const { metrics, categories } = metaToMetricsCategories(resolvedMeta);

      // Report an independent incident
      this.slardarInstance?.('sendEvent', {
        name: eventName,
        metrics,
        categories,
      });
    } else if (message) {
      const resolvedMeta = resolveMeta({
        ...meta,
      });

      // report log
      this.slardarInstance?.('sendLog', {
        level: getSlardarLevel(level),
        content: message,
        // Slardar will handle the classification of extra, put the fields of number type into metrics, and put the others into categories.
        extra: normalizeExtra(resolvedMeta),
      });
    }
  }
}

export type { SlardarInstance };
