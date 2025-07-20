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
 
import { execSync } from 'child_process';

/**
 * 获取当前 git 分支名称
 * @returns 当前分支名称，如果不在 git 仓库中或发生错误则返回 undefined
 */
export function getCurrentBranch(): string | undefined {
  try {
    // 使用 git rev-parse 获取当前分支名
    // --abbrev-ref 参数返回分支名而不是 commit hash
    // HEAD 表示当前位置
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim();

    // 如果在 detached HEAD 状态，返回 undefined
    if (branch === 'HEAD') {
      return undefined;
    }

    return branch;
  } catch (error) {
    // 如果执行出错（比如不在 git 仓库中），返回 undefined
    return '';
  }
}
