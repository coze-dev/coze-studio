import { isNil } from 'lodash-es';

import {
  type CommonLogOptions,
  LogAction,
  type LoggerReportClient,
  type BaseLoggerOptions,
  type LogOptionsResolver,
  LogLevel,
} from '../types';
import { LogOptionsHelper } from './log-options-helper';
import { consoleLogClient } from './console-client';

const defaultLogOptions = {
  level: LogLevel.INFO,
  action: [LogAction.CONSOLE],
};

function unwrapOptions(payload: string | CommonLogOptions): CommonLogOptions {
  if (typeof payload === 'string') {
    return {
      message: payload,
    };
  }
  return payload;
}

function resolveClients(
  clients: LoggerReportClient[],
  disableConsole?: boolean,
) {
  const result = clients.includes(consoleLogClient)
    ? clients
    : [consoleLogClient, ...clients];

  if (disableConsole) {
    return result.filter(item => item !== consoleLogClient);
  }

  return result;
}

export class BaseLogger<T extends CommonLogOptions = CommonLogOptions> {
  ctx: LogOptionsHelper<CommonLogOptions>;

  logOptionsResolvers: LogOptionsResolver[] = [];

  disableConsole: boolean;

  private clients: LoggerReportClient[];

  constructor({
    ctx = {},
    clients = [],
    beforeSend = [],
    disableConsole,
  }: BaseLoggerOptions) {
    this.ctx = new LogOptionsHelper(ctx);
    this.clients = clients;
    this.logOptionsResolvers = beforeSend;
    this.disableConsole = disableConsole || false;
  }

  addClient(client: LoggerReportClient) {
    this.clients.push(client);
  }

  resolveCloneParams({
    ctx,
    clients = [],
    beforeSend = [],
    disableConsole,
  }: BaseLoggerOptions) {
    return {
      // @ts-expect-error -- linter-disable-autofix
      ctx: LogOptionsHelper.merge(this.ctx.get(), ctx),
      clients: [...this.clients, ...clients],
      beforeSend: [...this.logOptionsResolvers, ...beforeSend],
      disableConsole: isNil(disableConsole)
        ? this.disableConsole
        : disableConsole,
    };
  }

  createLoggerWith<P extends CommonLogOptions = CommonLogOptions>(
    options: BaseLoggerOptions,
  ) {
    return new BaseLogger<P>(this.resolveCloneParams(options));
  }

  log(options: CommonLogOptions) {
    const payload = LogOptionsHelper.merge(
      defaultLogOptions,
      this.ctx.get(),
      options,
    );
    const resolvedPayload =
      this.logOptionsResolvers.length > 0
        ? this.logOptionsResolvers.reduce(
            (acc, cur) => (cur ? cur(acc) : acc),
            { ...payload },
          )
        : payload;

    const resolvedClients = this.disableConsole
      ? this.clients.filter(item => item !== consoleLogClient)
      : this.clients;

    resolvedClients.forEach(client => {
      client.send(resolvedPayload);
    });
  }

  fatal(payload: T & { error: Error }) {
    this.log({
      ...payload,
      level: LogLevel.FATAL,
    });
  }

  error(payload: T & { error: Error }) {
    this.log({
      ...payload,
      level: LogLevel.ERROR,
    });
  }

  warning(payload: string | T) {
    this.log({
      ...unwrapOptions(payload),
      level: LogLevel.WARNING,
    });
  }

  info(payload: string | T) {
    this.log({
      ...unwrapOptions(payload),
      level: LogLevel.INFO,
    });
  }

  success(payload: string | T) {
    this.log({
      ...unwrapOptions(payload),
      level: LogLevel.SUCCESS,
    });
  }
}

export class Logger extends BaseLogger {
  constructor({ clients = [], ...rest }: BaseLoggerOptions = {}) {
    super({
      ...rest,
      clients: resolveClients(clients, rest.disableConsole),
    });
  }

  addClient(client: LoggerReportClient) {
    super.addClient(client);
    this.persist.addClient(client);
  }

  createLoggerWith(options: BaseLoggerOptions) {
    return new Logger(this.resolveCloneParams(options));
  }

  persist = super.createLoggerWith<CommonLogOptions>({
    ctx: {
      action: [LogAction.CONSOLE, LogAction.PERSIST],
    },
  });

  // createEvent(eventName: string, logOptions?: CommonLogOptions) {
  //   return new EventLogger({
  //     eventName,
  //     logOptions,
  //     persistLogger: this,
  //   });
  // }
}
