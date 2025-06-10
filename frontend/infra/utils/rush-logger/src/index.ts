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

/** @deprecated 该使用方式已废弃，请使用`import { logger } from  '@coze-arch/rush-logger' */
export default logger;
