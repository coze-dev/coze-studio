import { REPORT_EVENTS } from '@coze-arch/report-events';
import { logger, reporter } from '@coze-arch/logger';

/**
 * @deprecated 这其实是 unsafe 的，请换用 typeSafeJSONParse
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
