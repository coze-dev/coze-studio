import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { GitOptions } from '../types';

/**
 * Get the project root directory (git repository root)
 */
export const getProjectRoot = (): string => {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    throw new Error('Not in a git repository or git is not available');
  }
};

/**
 * Get list of changed files in git working directory (includes both modified and added files)
 */
export const getChangedFiles = (options: GitOptions = { cwd: process.cwd() }): string[] => {
  try {
    // Get both modified files and added files
    const modifiedOutput = execSync('git diff --name-only', {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const addedOutput = execSync('git diff --cached --name-only', {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const modifiedFiles = modifiedOutput
      .split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0);

    const addedFiles = addedOutput
      .split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0);

    // Combine and deduplicate
    const allFiles = Array.from(new Set([...modifiedFiles, ...addedFiles]));

    return allFiles.map(file => resolve(options.cwd, file));
  } catch (error) {
    throw new Error(`Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get list of modified files relative to a git reference
 */
export const getModifiedFiles = (options: GitOptions = { cwd: process.cwd() }): string[] => {
  try {
    const output = execSync(`git diff --name-only ${options.ref || 'HEAD'}`, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    return output
      .split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0);
  } catch (error) {
    throw new Error(`Failed to get modified files: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get file content from a specific git reference
 */
export const getFileContentAtRef = (filePath: string, options: GitOptions): string => {
  try {
    const projectRoot = getProjectRoot();
    const relativePath = filePath.startsWith(projectRoot)
      ? filePath.substring(projectRoot.length + 1)
      : filePath;

    return execSync(`git show ${options.ref || 'HEAD'}:${relativePath}`, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
  } catch (error) {
    throw new Error(`Failed to get file content at ref: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Check if a file is newly added (not in HEAD)
 */
export const isNewFile = (filePath: string, options: GitOptions): boolean => {
  try {
    const projectRoot = getProjectRoot();
    const relativePath = filePath.startsWith(projectRoot)
      ? filePath.substring(projectRoot.length + 1)
      : filePath;

    execSync(`git show ${options.ref || 'HEAD'}:${relativePath}`, {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'ignore']
    });

    // If git show succeeds, the file exists in HEAD, so it's not new
    return false;
  } catch (error) {
    // If git show fails, the file doesn't exist in HEAD, so it's new
    return true;
  }
};

/**
 * Check if a file has only whitespace changes (including blank lines)
 */
export const hasOnlyWhitespaceChanges = (filePath: string, options: GitOptions): boolean => {
  try {
    // Skip analysis for new files
    if (isNewFile(filePath, options)) {
      return false;
    }

    const projectRoot = getProjectRoot();
    const relativePath = filePath.startsWith(projectRoot)
      ? filePath.substring(projectRoot.length + 1)
      : filePath;

    // Use -w to ignore whitespace changes and -b to ignore blank line changes
    // --ignore-space-at-eol ignores changes in whitespace at EOL
    // --ignore-blank-lines ignores changes whose lines are all blank
    const output = execSync(`git diff -w -b --ignore-space-at-eol --ignore-blank-lines ${options.ref || 'HEAD'} -- "${relativePath}"`, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    return output.trim() === '';
  } catch (error) {
    // If git diff fails, assume the file has changes
    return false;
  }
};

/**
 * Revert a file to its state in the git reference
 */
export const revertFile = (filePath: string, options: GitOptions): void => {
  try {
    const projectRoot = getProjectRoot();
    const relativePath = filePath.startsWith(projectRoot)
      ? filePath.substring(projectRoot.length + 1)
      : filePath;

    execSync(`git checkout ${options.ref || 'HEAD'} -- "${relativePath}"`, {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    throw new Error(`Failed to revert file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Check if we're in a git repository
 */
export const isGitRepository = (cwd: string = process.cwd()): boolean => {
  try {
    execSync('git rev-parse --git-dir', {
      cwd,
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Find git repository root by recursively searching for .git directory
 * @param startDir Directory to start searching from
 * @returns Git repository root path or null if not found
 */
export const findGitRepositoryRoot = (startDir: string): string | null => {
  // Check if .git exists in current directory
  const gitDir = join(startDir, '.git');
  if (existsSync(gitDir)) {
    return startDir;
  }

  // Recursively check parent directories
  let currentDir = startDir;
  while (currentDir !== dirname(currentDir)) {
    const parentGitDir = join(currentDir, '.git');
    if (existsSync(parentGitDir)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }

  return null;
};

/**
 * Validate that a directory is within a git repository
 * @param cwd Directory to validate
 * @throws Error if not in a git repository
 */
export const validateGitRepository = (cwd: string): void => {
  const gitRoot = findGitRepositoryRoot(cwd);
  if (!gitRoot) {
    throw new Error(`Not a git repository (or any parent directory): ${cwd}`);
  }
};
