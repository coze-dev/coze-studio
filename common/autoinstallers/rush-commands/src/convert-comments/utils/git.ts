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

import { simpleGit } from 'simple-git';
import * as path from 'path';
import { tryCatch } from './fp';
import { Result } from '../types/index';

/**
 * Get all tracked files in the Git repository
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
 * Get all files in the Git repository (including untracked ones)
 */
export const getAllGitFiles = async (
  root: string,
): Promise<Result<string[]>> => {
  return tryCatch(async () => {
    const git = simpleGit(root);

    // Get tracked files
    const trackedFiles = await git.raw(['ls-files']);
    const trackedFilesArray = trackedFiles
      .split('\n')
      .filter(Boolean)
      .map(file => path.resolve(root, file));

    // Get untracked files
    const status = await git.status();
    const untrackedFiles = status.not_added.map(file =>
      path.resolve(root, file),
    );

    // Merge and deduplicate
    const allFiles = [...new Set([...trackedFilesArray, ...untrackedFiles])];

    return allFiles;
  });
};

/**
 * Check if the directory is a Git repository
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
 * Get the root directory of the Git repository
 */
export const getGitRoot = async (cwd: string): Promise<Result<string>> => {
  return tryCatch(async () => {
    const git = simpleGit(cwd);
    const root = await git.revparse(['--show-toplevel']);
    return root.trim();
  });
};

/**
 * Check if the file is ignored by Git
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
      return true; // File is ignored
    } catch {
      return false; // File is not ignored
    }
  });
};
