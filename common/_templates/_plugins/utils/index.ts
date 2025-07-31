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

import type { ILogger } from 'rush-init-project-plugin';
// eslint-disable-next-line @infra/no-deep-relative-import
import { spawnSync } from 'child_process';

const exec = (
  logger: ILogger,
  cmd: string,
  args: string[],
): string | undefined => {
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
