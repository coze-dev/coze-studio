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
 
import path from 'path';
import fs from 'fs/promises';

import { OUTPUT_DIR } from './const';

// 复制目录的函数
const copyDir = async (src: string, dest: string) => {
  // 读取目录下所有文件/文件夹
  const entries = await fs.readdir(src, { withFileTypes: true });

  // 创建目标目录
  await fs.mkdir(dest, { recursive: true });

  // 遍历所有文件/文件夹
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 如果是文件夹则递归复制
      await copyDir(srcPath, destPath);
    } else {
      // 如果是文件则直接复制
      await fs.copyFile(srcPath, destPath);
    }
  }
};

export const buildAssets = async () => {
  const source = path.resolve(
    path.dirname(require.resolve('pdfjs-dist/package.json')),
    './cmaps',
  );
  await copyDir(source, path.resolve(OUTPUT_DIR, './cmaps'));
};
