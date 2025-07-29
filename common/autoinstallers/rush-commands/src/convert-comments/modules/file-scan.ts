import { promises as fs } from 'fs';
import { SourceFile, FileScanConfig, Result } from '../types/index';
import { detectLanguage, filterFilesByExtensions, isTextFile } from '../utils/language';
import { getGitTrackedFiles, getAllGitFiles } from '../utils/git';
import { tryCatch } from '../utils/fp';

/**
 * 读取文件内容并创建SourceFile对象
 */
export const readSourceFile = async (filePath: string): Promise<Result<SourceFile>> => {
  return tryCatch(async () => {
    const content = await fs.readFile(filePath, 'utf-8');
    const language = detectLanguage(filePath);

    return {
      path: filePath,
      content,
      language
    };
  });
};

/**
 * 批量读取源文件
 */
export const readSourceFiles = async (filePaths: string[]): Promise<SourceFile[]> => {
  const results = await Promise.allSettled(
    filePaths.map(path => readSourceFile(path))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<Result<SourceFile>> =>
      result.status === 'fulfilled' && result.value.success
    )
    .map(result => (result.value as { success: true; data: SourceFile }).data);
};

/**
 * 获取Git仓库中的源码文件
 */
export const getSourceFiles = async (config: FileScanConfig): Promise<Result<string[]>> => {
  const { root, extensions, includeUntracked } = config;

  return tryCatch(async () => {
    // 获取Git文件列表
    const gitFilesResult = includeUntracked
      ? await getAllGitFiles(root)
      : await getGitTrackedFiles(root);

    if (!gitFilesResult.success) {
      throw gitFilesResult.error;
    }

    let files = gitFilesResult.data;

    // 过滤文本文件
    files = files.filter(isTextFile);

    // 根据扩展名过滤
    if (extensions.length > 0) {
      files = filterFilesByExtensions(files, extensions);
    }

    return files;
  });
};

/**
 * 扫描并读取所有源码文件
 */
export const scanSourceFiles = async (config: FileScanConfig): Promise<Result<SourceFile[]>> => {
  return tryCatch(async () => {
    const filesResult = await getSourceFiles(config);

    if (!filesResult.success) {
      throw filesResult.error;
    }

    const sourceFiles = await readSourceFiles(filesResult.data);
    return sourceFiles;
  });
};

/**
 * 检查文件是否存在且可读
 */
export const isFileAccessible = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取文件统计信息
 */
export const getFileStats = async (filePaths: string[]): Promise<{
  total: number;
  accessible: number;
  textFiles: number;
  supportedFiles: number;
}> => {
  const accessibilityResults = await Promise.allSettled(
    filePaths.map(isFileAccessible)
  );

  const accessible = accessibilityResults.filter(
    (result): result is PromiseFulfilledResult<boolean> =>
      result.status === 'fulfilled' && result.value
  ).length;

  const textFiles = filePaths.filter(isTextFile).length;
  const supportedFiles = filePaths.filter(path => detectLanguage(path) !== 'other').length;

  return {
    total: filePaths.length,
    accessible,
    textFiles,
    supportedFiles
  };
};
