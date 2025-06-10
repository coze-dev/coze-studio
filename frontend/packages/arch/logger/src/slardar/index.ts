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
 * 将 meta 根据类型转换成
 * - 指标 metrics：可以被度量的值，也就是数值
 * - 维度 categories：分类，维度，用来做筛选，分组
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
    // 业务项目里可能有多个 slardar 版本，多个版本的类型不兼容，constructor 里约束版本会存在问题 => 放开。
    this.slardarInstance = slardarInstance;

    if (!this.slardarInstance) {
      console.warn('expected slardarInstance but get undefined/null');
    }
  }

  send(options: CommonLogOptions) {
    if (!options.action?.includes(LogAction.PERSIST)) {
      // 非持久化日志，不上报
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

      // 上报 JS 异常
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

      // 上报独立的事件
      this.slardarInstance?.('sendEvent', {
        name: eventName,
        metrics,
        categories,
      });
    } else if (message) {
      const resolvedMeta = resolveMeta({
        ...meta,
      });

      // 上报日志
      this.slardarInstance?.('sendLog', {
        level: getSlardarLevel(level),
        content: message,
        // slardar 内部会对 extra 处理分类，number 类型的字段放入 metrics，其他放入 categories
        extra: normalizeExtra(resolvedMeta),
      });
    }
  }
}

export type { SlardarInstance };
