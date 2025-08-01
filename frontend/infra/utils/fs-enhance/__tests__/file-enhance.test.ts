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
import { type Mock } from 'vitest';
import { parse } from 'json5';

import {
  readFileLineCount,
  isFileExists,
  isDirExists,
  ensureDir,
  readYamlFile,
} from '../src/index';
// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as fileEnhance from '../src/index';

vi.mock('yaml', () => ({ parse: vi.fn() }));

vi.mock('fs/promises');
vi.mock('json5', () => ({
  parse: vi.fn(),
}));

describe('file-enhance', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the number of lines in the file by calling `readFileLineCount`', async () => {
    // Arrange
    const file = 'test-file.txt';
    const content = 'Line 1\nLine 2\nLine 3\n';

    (fs.readFile as Mock).mockResolvedValue(content);

    // Act
    const result = await readFileLineCount(file);

    // Assert
    expect(fs.readFile).toHaveBeenCalledWith(file, 'utf-8');
    expect(result).toEqual(4);
  });

  it('should return true if the file exists by calling `isFileExists`', async () => {
    (fs.stat as Mock).mockResolvedValue({ isFile: () => true });

    const file = 'path/to/your/file.txt';
    const result = await isFileExists(file);

    expect(result).toBe(true);
    expect(fs.stat).toHaveBeenCalledWith(file);
  });

  it('should return false if the file does not exist by calling `isFileExists`', async () => {
    (fs.stat as Mock).mockRejectedValue(new Error('File not found'));

    const file = 'path/to/nonexistent/file.txt';
    const result = await isFileExists(file);

    expect(result).toBe(false);
    expect(fs.stat).toHaveBeenCalledWith(file);
  });

  it('should return true if the dir exists by calling `isDirExists`', async () => {
    (fs.stat as Mock).mockResolvedValue({ isDirectory: () => true });

    const file = 'path/to/your/dir';
    const result = await isDirExists(file);

    expect(result).toBe(true);
    expect(fs.stat).toHaveBeenCalledWith(file);
  });

  it('should return true if the dir does not exist by calling `isDirExists`', async () => {
    (fs.stat as Mock).mockRejectedValue(new Error('Dir not found'));

    const file = 'path/to/nonexistent/dir';
    const result = await isDirExists(file);

    expect(result).toBe(false);
    expect(fs.stat).toHaveBeenCalledWith(file);
  });

  it('should create a dir if it does not exist by calling `ensureDir`', async () => {
    vi.spyOn(fileEnhance, 'isDirExists').mockResolvedValue(false);
    (fs.mkdir as Mock).mockReturnValue('');

    const file = 'path/to/new/dir';
    const result = await ensureDir(file);

    expect(result).toBe(undefined);
    expect(fs.mkdir).toHaveBeenCalledWith(file, { recursive: true });
  });

  it('should not create a dir if it exists', async () => {
    vi.spyOn(fileEnhance, 'isDirExists').mockResolvedValue(true);

    const file = 'path/to/existed/dir';
    const result = await ensureDir(file);

    expect(result).toBe(undefined);
    expect(fs.mkdir).not.toHaveBeenCalledWith();
  });

  it('readJsonFile', async () => {
    (parse as Mock).mockReturnValue({});
    (fs.readFile as Mock).mockResolvedValueOnce('');

    const file = 'path/json/file';
    const result = await fileEnhance.readJsonFile(file);

    expect(fs.readFile).toHaveBeenCalledWith(file, 'utf-8');
    expect(result).toStrictEqual({});
  });

  it('readYamlFile', async () => {
    (parseYaml as Mock).mockReturnValue({});
    (fs.readFile as Mock).mockResolvedValueOnce('');

    const file = 'path/json/file';
    const result = await readYamlFile(file);

    expect(fs.readFile).toHaveBeenCalledWith(file, 'utf-8');
    expect(result).toStrictEqual({});
  });

  it('writeJsonFile', async () => {
    const file = 'path/to/write';
    await fileEnhance.writeJsonFile(file, {});
    expect(fs.writeFile).toHaveBeenCalledWith(file, '{}');
  });
});
