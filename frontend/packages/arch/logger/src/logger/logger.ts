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

import {
  type CommonLogOptions,
  type BaseLoggerOptions,
  type LoggerReportClient,
} from '../types';
import { SlardarReportClient, type SlardarInstance } from '../slardar';
import { shouldCloseConsole } from '../console-disable';
import { Logger as RawLogger, type BaseLogger } from './core';
export type SetupKey = 'no-console';
export type SetupConfig = Record<SetupKey, unknown>;

export class Logger extends RawLogger {
  private registeredInstance: Logger[] = [];
  private slardarInstance: SlardarInstance | null = null;
  static setupConfig: SetupConfig | null = null;

  private setDisableConsole() {
    if (!Logger.setupConfig?.['no-console']) {
      return;
    }
    const disableConsole = shouldCloseConsole();
    this.disableConsole = disableConsole;
    if (this.persist) {
      this.persist.disableConsole = disableConsole;
    }
  }

  /**
   * The @deprecated logger method is only used for console printing, and there is no need to manually add the slardar client. If you need to report the log, please use'import {reporter} from '@code-arch/logger'. Specific specifications:
   */
  addClient(client: LoggerReportClient): void {
    super.addClient(client);
  }

  /**
   * @Deprecated This method is deprecated, please use'import {reporter} from '@code-arch/logger' to replace it uniformly. Specific specifications:
   */
  persist: BaseLogger<CommonLogOptions> = this.persist;

  /**
   * The @deprecated logger method is only used for console printing, and there is no need to manually add the slardar client. If you need to report the log, please use'import {reporter} from '@code-arch/logger'. Specific specifications:
   */
  init(slardarInstance: SlardarInstance) {
    const client = new SlardarReportClient(slardarInstance);
    this.persist?.addClient(client);
    this.slardarInstance = client.slardarInstance;
    this.registeredInstance.forEach(instance => {
      instance.init(client.slardarInstance);
    });
    this.registeredInstance = [];
  }

  /**
   * Setup some attributes of config of logger at any time
   * @param setupConfig the config object needed to setup
   */
  setup(config: SetupConfig) {
    Logger.setupConfig = config;
  }

  createLoggerWith(options: BaseLoggerOptions): Logger {
    const logger = new Logger(this.resolveCloneParams(options));
    if (this.slardarInstance) {
      logger.init(this.slardarInstance);
    } else {
      this.registeredInstance.push(logger);
    }

    return logger;
  }

  info(payload: string | CommonLogOptions): void {
    this.setDisableConsole();
    super.info(payload);
  }

  success(payload: string | CommonLogOptions): void {
    this.setDisableConsole();
    super.success(payload);
  }

  warning(payload: string | CommonLogOptions): void {
    this.setDisableConsole();
    super.warning(payload);
  }

  error(payload: CommonLogOptions & { error: Error }): void {
    this.setDisableConsole();
    super.error(payload);
  }
}

const logger = new Logger({
  clients: [],
  ctx: {
    meta: {},
  },
});

export { logger };
