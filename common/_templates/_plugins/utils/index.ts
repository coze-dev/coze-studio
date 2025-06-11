import type { ILogger } from 'rush-init-project-plugin';
// eslint-disable-next-line @infra/no-deep-relative-import
import { spawnSync } from 'child_process';

const exec = (logger: ILogger, cmd: string, args: string[]): string | undefined => {
  try {
    if (!cmd) {
      return undefined;
    }
    logger?.verbose(`Exec: ${cmd}`);
    const { stdout } = spawnSync(cmd, args);
    const result = stdout.toString();
    logger?.verbose(`Cmd res: ${result}`);
    return result.trim();
  } catch (err) {
    logger?.error(String(err));
    throw err;
  }
};

export { exec };
