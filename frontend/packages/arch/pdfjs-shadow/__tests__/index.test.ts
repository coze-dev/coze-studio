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

import { describe, it, expect, vi } from 'vitest';

// Emulate pdfjs-dist module
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
}));

// Emulate generate-assets and init-pdfjs-dist modules
vi.mock('../src/generate-assets', () => ({
  generatePdfAssetsUrl: vi.fn(),
}));

vi.mock('../src/init-pdfjs-dist', () => ({
  initPdfJsWorker: vi.fn(),
}));

// Import the tested module
import {
  generatePdfAssetsUrl,
  initPdfJsWorker,
  getDocument,
} from '../src/index';

describe('pdfjs-shadow index', () => {
  it('应该导出所有必要的函数和类型', () => {
    // Validate the derived function
    expect(typeof generatePdfAssetsUrl).toBe('function');
    expect(typeof initPdfJsWorker).toBe('function');

    // Verify functions and types re-exported from pdfjs-dist
    expect(getDocument).toBeDefined();
  });
});
