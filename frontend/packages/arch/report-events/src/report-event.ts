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

import { set } from 'lodash-es';
import { logger as globalLogger, type Logger } from '@coze-arch/logger';

import { type EventNames } from './events';

/** Describes the points used to calculate duration */
export interface DurationPoint {
  /** A point name, usually an action */
  pointName: string;
  /** Current timestamp, used to calculate duration */
  time: number;
}

export interface ReportEvent {
  /**
   * Event start. Logging of gastTime for subsequent use to calculate duration
   * Note: Events are created automatically and generally do not require a call
   */
  start: () => void;
  /**
   * Report a success event. Carry success = 1, duration parameter
   */
  success: (payload?: { meta?: Record<string, unknown> }) => void;
  /**
   * Report a failure event. Carry success = 0, error, reason parameters
   * - reason: finite enumeration, causes of failure
   */
  error: (payload: {
    reason: string;
    error?: Error;
    meta?: Record<string, unknown>;
  }) => void;
  /**
   * Add a point named @param pointName to calculate duration
   *
   * Assuming there are three points [a, b, c], the final reported duration is
   * duration: {
   *   a: aTime - startTime,
   *   b: bTime - startTime,
   *   c: cTime - startTime,
   *   interval: {
   *     a: aTime - startTime,
   *     b: bTime - aTime,
   *     c: cTime - bTime,
   *   }
   * }
   */
  addDurationPoint: (pointName: string) => void;
  /**
   * acquisition time
   */
  getDuration: () => Record<string, number> | undefined;
  /** Get Meta, typically used to get the meta field set at creation time */
  getMeta: () => Record<string, unknown>;
}

//

/**
 * Create a standard reporting event
 * - Success: success = 1, duration = {...}
 * - Failure: success = 0, reason, error
 */
/**
 * @Deprecated This method is deprecated, please replace it with'reporter .tracer 'of'import {reporter} from' @code-arch/logger '. For details, please check:
 */
export const createReportEvent = ({
  eventName,
  logger: propsLogger,
  meta: metaInCtx,
}: {
  eventName: EventNames;
  logger?: Logger;
  meta?: Record<string, unknown>;
}): ReportEvent => {
  const logger = propsLogger || globalLogger;
  const durationPoints: DurationPoint[] = [];
  let startTime = 0;
  let isFinished = false;

  const start = () => {
    startTime = Date.now();
  };

  const getMetaInCtx = () => ({
    ...metaInCtx,
    ...(isFinished
      ? {
          event_has_finished: true, // Marks that the event has had success/error, indicating that there may be a problem
        }
      : {}),
  });

  const getDuration = () => {
    if (durationPoints.length === 0) {
      return;
    }

    return durationPoints.reduce<Record<string, number>>((acc, cur, index) => {
      const { pointName } = cur;
      acc[pointName] = cur.time - startTime;
      set(
        acc,
        ['interval', pointName],
        index === 0
          ? acc[pointName]
          : cur.time - durationPoints[index - 1].time,
      );
      return acc;
    }, {});
  };

  const success = ({ meta }: { meta?: Record<string, unknown> } = {}) => {
    logger.persist.success({
      eventName,
      meta: {
        ...getMetaInCtx(),
        success: 1,
        duration: getDuration(),
        ...meta,
      },
    });

    isFinished = true;
  };

  const sendError = ({
    reason,

    error,
    meta,
  }: {
    reason: string;
    error?: Error;
    meta?: Record<string, unknown>;
  }) => {
    logger.persist.error({
      eventName,

      error: error ? error : new Error(reason),
      meta: {
        ...getMetaInCtx(),
        success: 0,
        reason,
        ...meta,
      },
    });

    isFinished = true;
  };

  const addDurationPoint = (pointName: string) => {
    durationPoints.push({
      pointName,
      time: Date.now(),
    });
  };

  start();

  return {
    start,
    addDurationPoint,
    getDuration,
    success,
    error: sendError,
    getMeta: getMetaInCtx,
  };
};
