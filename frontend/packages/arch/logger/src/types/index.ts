/**
 * 日志级别
 */
export const enum LogLevel {
  /**
   * 日志
   */
  INFO = 'info',
  /**
   * 成功日志
   */
  SUCCESS = 'success',
  /**
   * 接口问题导致的错误
   * 不影响用户使用的边缘 case
   * 非核心功能问题
   */
  WARNING = 'warning',
  /**
   * 严重错误
   */
  ERROR = 'error',
  /**
   * 故障
   */
  FATAL = 'fatal',
  // DEBUG = 'debug', 暂时去掉，目前和 info 重合，后面按需加
}
/**
 * 日志动作，描述消费日志的行为
 */
export const enum LogAction {
  /**
   * 输出到浏览器控制台
   */
  CONSOLE = 'console',
  /**
   * 持久化，即上报至平台
   */
  PERSIST = 'persist',
}

/**
 * 通用日志配置
 */
export interface CommonLogOptions {
  /**
   * 命名空间
   */
  namespace?: string;
  /**
   * 作用域
   * 层级：namespace > scope
   */
  scope?: string;
  /**
   * 日志级别
   * @default LogLevel.INFO
   */
  level?: LogLevel;
  /**
   * 日志动作，描述消费日志的行为
   * @default [LogAction.CONSOLE]
   */
  action?: LogAction[];
  /**
   * 日志消息
   * 输出到浏览器控制台场景下必填。
   * 最终输出到浏览器控制台： ${namespace} ${scope} ${message}
   */
  message?: string;
  /**
   * 事件名
   * 上报事件场景下必填。
   */
  eventName?: string;
  /**
   * 扩展信息，可用于描述日志/事件的上下文信息
   */
  meta?: Record<string, unknown>;
  /**
   * Error
   * 错误日志/事件场景下必填
   */
  error?: Error;
}

/**
 * 上报平台 Client
 */
export interface LoggerReportClient {
  send: (options: CommonLogOptions) => void;
}

export type LogOptionsResolver = (
  options: CommonLogOptions,
) => CommonLogOptions;

export interface BaseLoggerOptions {
  ctx?: CommonLogOptions;
  clients?: LoggerReportClient[];
  beforeSend?: LogOptionsResolver[];
  disableConsole?: boolean;
}

// Make some properties required
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * 美化输出，开发提效
 * type A = { a: string };
 * type B = { b: string };
 * type C = A & B;
 * type PrettyC = Pretty<A & B>;
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Pretty<T extends Record<string, any>> = {
  [key in keyof T]: T[key];
};

export type LogOptions = Pretty<WithRequired<CommonLogOptions, 'message'>>;

export const enum ErrorType {
  /**
   * API httpCode 非 200
   */
  ApiError = 'ApiError',
  /**
   * API httpCode 200，业务 Code 存在异常
   */
  ApiBizError = 'ApiBizError',
  /**
   * 未归类的错误
   */
  Unknown = 'Unknown',
}

export interface ApiErrorOption {
  httpStatus: string;
  /**
   * 业务 code
   */
  code?: string;
  message?: string;
  logId?: string;
  requestConfig?: Record<string, unknown>;
  response?: Record<string, unknown>;
  /**
   * 错误类型，用于细化监控
   * @default ErrorType.ApiError
   */
  errorType?: string;
}
