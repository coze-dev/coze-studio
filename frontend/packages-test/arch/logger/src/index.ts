export { reporter, Reporter } from './reporter';

// reporter 需要上报到 slardar 的方法导出
export type {
  LoggerCommonProperties,
  CustomEvent,
  CustomErrorLog,
  CustomLog,
  ErrorEvent,
} from './reporter';
// console 控制台打印
export { logger, LoggerContext, Logger } from './logger';

// ErrorBoundary 相关方法
export {
  ErrorBoundary,
  useErrorBoundary,
  useErrorHandler,
  type ErrorBoundaryProps,
  type FallbackProps,
} from './error-boundary';

export { SlardarReportClient, type SlardarInstance } from './slardar';

export { LogLevel } from './types';

export { getSlardarInstance, setUserInfoContext } from './slardar/runtime';
