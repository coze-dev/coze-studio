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
