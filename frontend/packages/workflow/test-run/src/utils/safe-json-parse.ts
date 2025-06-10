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
    // 日志解析
    if (options?.needReport) {
      reporter.errorEvent({
        error: e as Error,
        eventName: REPORT_EVENTS.parseJSON,
      });
    }
    return options?.emptyValue;
  }
};
