import { type CommonLogOptions, LogAction, LogLevel } from '../types';
import { SlardarReportClient, type SlardarInstance } from '../slardar';
import { Logger } from '../logger';
import { genDurationTracer, type TracePointName } from './duration-tracer';

export interface LoggerCommonProperties {
  namespace?: string;
  scope?: string;
}

export interface SlardarMeta {
  meta?: Record<string, unknown>; // Combination of `categories` and `metrics`, check more: 
}

export interface CustomLog extends SlardarMeta, LoggerCommonProperties {
  message: string;
}

export type CustomErrorLog = CustomLog & { error: Error };

export interface CustomEvent<EventEnum extends string>
  extends SlardarMeta,
    LoggerCommonProperties {
  eventName: EventEnum;
}

export interface ErrorEvent<EventEnum extends string>
  extends CustomEvent<EventEnum> {
  error: Error;
  level?: 'error' | 'fatal';
}

export interface TraceEvent<EventEnum extends string>
  extends LoggerCommonProperties {
  eventName: EventEnum;
}

export interface TraceOptions extends SlardarMeta {
  error?: Error;
}

type ReporterConfig = LoggerCommonProperties & SlardarMeta;

type LogType = 'info' | 'success' | 'warning' | 'error';

export class Reporter {
  private initialized = false;
  private logger: Logger;
  private pendingQueue: CommonLogOptions[] = [];
  private pendingInstance: Reporter[] = [];
  public slardarInstance: SlardarInstance | null = null;

  private log(type: LogType, payload: CommonLogOptions) {
    if (!this.check(payload)) {
      return;
    }
    this.logger.disableConsole = true;
    this.logger[type](payload as CommonLogOptions & { error: Error });
    this.logger.persist.disableConsole = true;
    this.logger.persist[type](payload as CommonLogOptions & { error: Error });
  }

  constructor(config?: ReporterConfig) {
    this.logger = new Logger({
      clients: [],
      ctx: {
        ...config,
      },
    });
  }

  /**
   * 创建一个带有preset的reporter，一般可以配置专属的`namespace`和`scope`
   * @param preset
   * @returns
   */
  createReporterWithPreset(preset: ReporterConfig) {
    const r = new Reporter(preset);
    if (this.initialized) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      r.init(this.slardarInstance!);
    } else {
      this.pendingInstance.push(r);
    }
    return r;
  }

  /**
   * 初始化reporter
   * @param slardarInstance 需要上报的slardar实例
   * @returns
   */
  init(slardarInstance: SlardarInstance) {
    if (!slardarInstance) {
      console.warn('You should use reporter with a valid slardar instance');
      return;
    }
    const slardarReportClient = new SlardarReportClient(slardarInstance);
    this.slardarInstance = slardarReportClient.slardarInstance;
    this.logger.persist.addClient(slardarReportClient);
    this.initialized = true;

    // Execute all pending items which are collected before initialization
    this.pendingQueue.forEach(item => {
      const levelFuncName: Omit<LogLevel, LogLevel.ERROR> =
        item.level || LogLevel.INFO;
      this.log(levelFuncName.toString() as LogType, item);
    });
    this.pendingQueue = [];

    // Run init for all pending reporter instances
    this.pendingInstance.forEach(instance => {
      instance.init(slardarInstance);
    });
    this.pendingInstance = [];
  }

  getLogger() {
    return this.logger;
  }

  /// Custom Log
  /**
   * 上报一个info日志
   * @param event 
   * @returns
   */
  info(log: CustomLog) {
    this.log('info', log);
  }

  /**
   * 上报一个success日志
   * @param event 
   * @returns
   */
  success(log: CustomLog) {
    const info = this.formatCustomLog(log, LogLevel.SUCCESS);
    this.log('success', info);
  }

  /**
   * 上报一个warning日志
   * @param event 
   * @returns
   */
  warning(log: CustomLog) {
    const info = this.formatCustomLog(log, LogLevel.WARNING);
    this.log('warning', info);
  }

  /**
   * 上报一个error日志
   * @param event 
   * @returns
   */
  error(log: CustomErrorLog) {
    const info = this.formatCustomLog(
      log,
      LogLevel.ERROR,
    ) as CommonLogOptions & { error: Error };
    this.log('error', info);
  }

  /// Custom Event
  /**
   * 上报一个自定义event事件
   * @param event 
   * @returns
   */
  event<EventEnum extends string>(event: CustomEvent<EventEnum>) {
    const e = this.formatCustomEvent(event);
    this.log('info', e);
  }

  /**
   * 上报一个错误event事件（LogLevel = 'error'）
   * @param event 
   * @returns
   */
  errorEvent<EventEnum extends string>(event: ErrorEvent<EventEnum>) {
    const e = this.formatErrorEvent(event) as CommonLogOptions & {
      error: Error;
    };
    this.log('error', e);
  }

  /**
   * 上报一个成功event事件（LogLevel = 'success'）
   * @param event 
   * @returns
   */
  successEvent<EventEnum extends string>(event: CustomEvent<EventEnum>) {
    const e = this.formatCustomEvent(event) as CommonLogOptions;
    this.log('success', e);
  }

  /// Trace Event
  /**
   * 性能追踪，可以记录一个流程中多个步骤间隔的耗时：
   * @param event
   * @returns
   */
  tracer<EventEnum extends string>({ eventName }: TraceEvent<EventEnum>) {
    const { tracer: durationTracer } = genDurationTracer();

    const trace = (pointName: TracePointName, options: TraceOptions = {}) => {
      const { meta, error } = options;
      const e = this.formatCustomEvent({
        eventName,
        meta: {
          ...meta,
          error,
          duration: durationTracer(pointName),
        },
      });
      if (!this.check(e)) {
        return;
      }
      this.log('info', e);
    };

    return {
      trace,
    };
  }

  private check(info: CommonLogOptions) {
    if (!this.initialized) {
      // Initialization has not been called, collect the item into queue and consume it when called.
      this.pendingQueue.push(info);
      return false;
    }
    return true;
  }

  private formatCustomLog(
    log: CustomLog | CustomErrorLog,
    level: LogLevel,
  ): CommonLogOptions {
    const {
      namespace: ctxNamespace,
      scope: ctxScope,
      meta: ctxMeta = {},
    } = this.logger.ctx?.options ?? {};
    const { namespace, scope, meta = {}, message } = log;
    return {
      action: [LogAction.CONSOLE, LogAction.PERSIST],
      namespace: namespace || ctxNamespace,
      scope: scope || ctxScope,
      level,
      error: (log as CustomErrorLog).error,

      message,
      meta: {
        ...ctxMeta,
        ...meta,
      },
    };
  }

  private formatCustomEvent<EventEnum extends string>(
    event: CustomEvent<EventEnum>,
  ): CommonLogOptions {
    const {
      namespace: ctxNamespace,
      scope: ctxScope,
      meta: ctxMeta = {},
    } = this.logger.ctx?.options ?? {};
    const { eventName, namespace, scope, meta = {} } = event;
    return {
      action: [LogAction.CONSOLE, LogAction.PERSIST],
      namespace: namespace || ctxNamespace,
      scope: scope || ctxScope,
      eventName,

      meta: {
        ...ctxMeta,
        ...meta,
      },
    };
  }

  private formatErrorEvent<EventEnum extends string>(
    event: ErrorEvent<EventEnum>,
  ): CommonLogOptions {
    const e = this.formatCustomEvent(event);
    return {
      ...e,
      meta: {
        ...e.meta,
        // !NOTE: Slardar不支持`a.b`的字段的正则搜索（会报错），需要把`error.message`和`error.name`铺平放到第一层
        errorMessage: event.error.message,
        errorName: event.error.name,
        level: event.level ?? 'error',
      },
      error: event.error,
    };
  }
}

const reporter = new Reporter();

export { reporter };
