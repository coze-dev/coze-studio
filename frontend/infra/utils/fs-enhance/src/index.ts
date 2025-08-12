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

import fs from 'fs/promises';

import { parse as parseYaml } from 'yaml';
import { parse } from 'json5';

export const readFileLineCount = async (file: string): Promise<number> => {
  const content = await fs.readFile(file, 'utf-8');
  return content.split('\n').length;
};

export const isFileExists = async (file: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch (e) {
    return false;
  }
};

export const isDirExists = async (file: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(file);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};

export const readJsonFile = async <T>(file: string): Promise<T> =>
  parse(await fs.readFile(file, 'utf-8'));

export const readYamlFile = async <T extends object>(
  filePath: string,
): Promise<T> => parseYaml(await fs.readFile(filePath, 'utf-8'));

export const writeJsonFile = async (
  file: string,
  content: unknown,
): Promise<void> => {
  await fs.writeFile(file, JSON.stringify(content, null, '  '));
};

export const ensureDir = async (dir: string) => {
  if (!(await isDirExists(dir))) {
    await fs.mkdir(dir, { recursive: true });
  }
};
