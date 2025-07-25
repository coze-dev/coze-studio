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

/** 描述用于计算 duration 的点位 */
export interface DurationPoint {
  /** 点位名，一般是某个行为 */
  pointName: string;
  /** 当前时间戳，用于计算 duration */
  time: number;
}

export interface ReportEvent {
  /**
   * 事件开始。记录 startTime，后续用于计算 duration
   * 注：创建事件时会自动执行，一般不需要调用
   */
  start: () => void;
  /**
   * 上报成功事件。携带 success=1、duration 参数
   */
  success: (payload?: { meta?: Record<string, unknown> }) => void;
  /**
   * 上报失败事件。携带 success=0、error、reason 参数
   * - reason: 有限枚举，导致失败的原因
   */
  error: (payload: {
    reason: string;
    error?: Error;
    meta?: Record<string, unknown>;
  }) => void;
  /**
   * 添加一个名为 @param pointName 的点位，用于计算 duration
   *
   * 假设有 [a、b、c] 三个点位，最终上报的 duration 是
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
   * 获取耗时
   */
  getDuration: () => Record<string, number> | undefined;
  /** 获取 Meta，一般用于获取创建时设置的 meta 字段 */
  getMeta: () => Record<string, unknown>;
}

//

/**
 * 创建一个标准的上报事件
 * - 成功：success=1，duration={...}
 * - 失败：success=0, reason, error
 */
/**
 * @deprecated 该方法已废弃，请统一使用`import { reporter } from '@coze-arch/logger'的`reporter.tracer`替换，具体请查看：
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
          event_has_finished: true, // 标记事件已 success/error 过，提示可能存在问题
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
