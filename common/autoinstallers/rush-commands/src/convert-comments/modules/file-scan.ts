import { promises as fs } from 'fs';
import { SourceFile, FileScanConfig, Result } from '../types/index';
import { detectLanguage, filterFilesByExtensions, isTextFile } from '../utils/language';
import { getGitTrackedFiles, getAllGitFiles } from '../utils/git';
import { tryCatch } from '../utils/fp';

/**
 * Read the file contents and create a SourceFile object
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
 * Batch reading of source files
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
 * Get the source code file in the Git repository
 */
export const getSourceFiles = async (config: FileScanConfig): Promise<Result<string[]>> => {
  const { root, extensions, includeUntracked } = config;

  return tryCatch(async () => {
    // Get a list of Git files
    const gitFilesResult = includeUntracked
      ? await getAllGitFiles(root)
      : await getGitTrackedFiles(root);

    if (!gitFilesResult.success) {
      throw gitFilesResult.error;
    }

    let files = gitFilesResult.data;

    // Filter text files
    files = files.filter(isTextFile);

    // Filter by extension
    files = filterFilesByExtensions(files, extensions);

    return files;
  });
};

/**
 * Scan and read all source code files
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
 * Check if the file exists and is readable
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
 * Get file statistics
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
