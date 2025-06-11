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
