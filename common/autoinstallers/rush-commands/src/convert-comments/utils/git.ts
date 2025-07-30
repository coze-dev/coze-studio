import { simpleGit } from 'simple-git';
import * as path from 'path';
import { tryCatch } from './fp';
import { Result } from '../types/index';

/**
 * 获取Git仓库中的所有已跟踪文件
 */
export const getGitTrackedFiles = async (
  root: string,
): Promise<Result<string[]>> => {
  return tryCatch(async () => {
    const git = simpleGit(root);
    const files = await git.raw(['ls-files']);

    return files
      .split('\n')
      .filter(Boolean)
      .map(file => path.resolve(root, file));
  });
};

/**
 * 获取Git仓库中的所有文件（包括未跟踪的）
 */
export const getAllGitFiles = async (
  root: string,
): Promise<Result<string[]>> => {
  return tryCatch(async () => {
    const git = simpleGit(root);

    // 获取已跟踪的文件
    const trackedFiles = await git.raw(['ls-files']);
    const trackedFilesArray = trackedFiles
      .split('\n')
      .filter(Boolean)
      .map(file => path.resolve(root, file));

    // 获取未跟踪的文件
    const status = await git.status();
    const untrackedFiles = status.not_added.map(file =>
      path.resolve(root, file),
    );

    // 合并并去重
    const allFiles = [...new Set([...trackedFilesArray, ...untrackedFiles])];

    return allFiles;
  });
};

/**
 * 检查目录是否是Git仓库
 */
export const isGitRepository = async (
  root: string,
): Promise<Result<boolean>> => {
  return tryCatch(async () => {
    const git = simpleGit(root);
    await git.status();
    return true;
  });
};

/**
 * 获取Git仓库的根目录
 */
export const getGitRoot = async (cwd: string): Promise<Result<string>> => {
  return tryCatch(async () => {
    const git = simpleGit(cwd);
    const root = await git.revparse(['--show-toplevel']);
    return root.trim();
  });
};

/**
 * 检查文件是否被Git忽略
 */
export const isIgnoredByGit = async (
  root: string,
  filePath: string,
): Promise<Result<boolean>> => {
  return tryCatch(async () => {
    const git = simpleGit(root);
    const relativePath = path.relative(root, filePath);

    try {
      await git.raw(['check-ignore', relativePath]);
      return true; // 文件被忽略
    } catch {
      return false; // 文件未被忽略
    }
  });
};
