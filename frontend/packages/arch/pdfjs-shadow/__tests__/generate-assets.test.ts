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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { generatePdfAssetsUrl } from '../src/generate-assets';
import pkg from '../package.json';

describe('generatePdfAssetsUrl', () => {
  const originalRegion = global.REGION;

  beforeEach(() => {
    // Reset simulation
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore original REGION value
    global.REGION = originalRegion;
  });

  it('应该为 cmaps 生成正确的 URL（中国区域）', () => {
    // Set the region to China
    global.REGION = 'cn';

    const url = generatePdfAssetsUrl('cmaps');

    // Verify URL format
    expect(url).toContain('//lf-cdn.coze.cn/obj/unpkg');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/cmaps/');
  });

  it('应该为 pdf.worker 生成正确的 URL（中国区域）', () => {
    // Set the region to China
    global.REGION = 'cn';

    const url = generatePdfAssetsUrl('pdf.worker');

    // Verify URL format
    expect(url).toContain('//lf-cdn.coze.cn/obj/unpkg');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/worker.js');
  });

  it('应该为 cmaps 生成正确的 URL（国际区域）', () => {
    // Set the region to International
    global.REGION = 'va';

    const url = generatePdfAssetsUrl('cmaps');

    // Verify URL format
    expect(url).toContain('//sf-cdn.coze.com/obj/unpkg-va');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/cmaps/');
  });

  it('应该为 pdf.worker 生成正确的 URL（国际区域）', () => {
    // Set the region to International
    global.REGION = 'va';

    const url = generatePdfAssetsUrl('pdf.worker');

    // Verify URL format
    expect(url).toContain('//sf-cdn.coze.com/obj/unpkg-va');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/worker.js');
  });

  it('应该在传入无效资源类型时抛出错误', () => {
    // Use type assertions to test error conditions
    expect(() => generatePdfAssetsUrl('invalid' as any)).toThrow(
      '目前只支持引用 cmaps 与 pdf.worker 文件',
    );
  });
});
