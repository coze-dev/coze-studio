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
  Colors,
  ConsoleTerminalProvider,
  Terminal,
} from '@rushstack/node-core-library';

class Logger {
  private terminal: Terminal;
  private $silent = false;

  constructor() {
    this.terminal = new Terminal(new ConsoleTerminalProvider());
  }

  warning(content: string, prefix?: boolean) {
    this.$writeLine(content, Colors.yellow, prefix, '[WARNING]');
  }

  debug(content: string, prefix?: boolean) {
    this.$writeLine(content, Colors.bold, prefix, '[DEBUG]');
  }

  success(content: string, prefix?: boolean) {
    this.$writeLine(content, Colors.green, prefix, '[SUCCESS]');
  }

  error(content: string, prefix?: boolean) {
    this.$writeLine(content, Colors.red, prefix, '[ERROR]');
  }

  info(content: string, prefix?: boolean) {
    this.$writeLine(content, Colors.blue, prefix, '[INFO]');
  }

  default(content: string) {
    this.terminal.writeLine(content);
  }

  turnOff() {
    this.$silent = true;
  }
  turnOn() {
    this.$silent = false;
  }

  // eslint-disable-next-line max-params
  private $writeLine(
    content: string,
    colorFn: typeof Colors.bold,
    prefix?: boolean,
    prefixText?: string,
  ) {
    prefix = prefix ?? true;
    const formattedContent = prefix ? `${prefixText} ${content}` : content;
    if (this.$silent === true && prefixText !== '[ERROR]') {
      // do nothings
      return;
    }
    return this.terminal.writeLine(colorFn(`${formattedContent}`));
  }
}

const logger = new Logger();

export { logger };

/** @Deprecated This usage is deprecated, please use'import {logger} from '@code-arch/rush-logger' */
export default logger;
