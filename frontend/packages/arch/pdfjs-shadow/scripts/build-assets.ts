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

// Function to copy directory
const copyDir = async (src: string, dest: string) => {
  // Read all files/folders in the directory
  const entries = await fs.readdir(src, { withFileTypes: true });

  // Create target directory
  await fs.mkdir(dest, { recursive: true });

  // Iterate through all files/folders
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // If it is a folder, copy it recursively.
      await copyDir(srcPath, destPath);
    } else {
      // If it is a file, copy it directly.
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
