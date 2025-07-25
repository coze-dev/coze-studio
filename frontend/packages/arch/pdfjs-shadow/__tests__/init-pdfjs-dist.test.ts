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

// 模拟 pdfjs-dist 模块
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
}));

// 模拟 generate-assets 模块
vi.mock('../src/generate-assets', () => ({
  generatePdfAssetsUrl: vi.fn().mockReturnValue('mocked-worker-url'),
}));

// 导入被测试的模块
import { GlobalWorkerOptions } from 'pdfjs-dist';

import { initPdfJsWorker } from '../src/init-pdfjs-dist';
import { generatePdfAssetsUrl } from '../src/generate-assets';

describe('initPdfJsWorker', () => {
  beforeEach(() => {
    // 每个测试前重置 GlobalWorkerOptions.workerSrc
    GlobalWorkerOptions.workerSrc = '';
    // 清除所有模拟函数的调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 每个测试后重置模拟
    vi.resetAllMocks();
  });

  it('应该设置 GlobalWorkerOptions.workerSrc 当它为空时', () => {
    // 确保 workerSrc 初始为空
    expect(GlobalWorkerOptions.workerSrc).toBe('');

    // 调用初始化函数
    initPdfJsWorker();

    // 验证 generatePdfAssetsUrl 被调用，且参数正确
    expect(generatePdfAssetsUrl).toHaveBeenCalledTimes(1);
    expect(generatePdfAssetsUrl).toHaveBeenCalledWith('pdf.worker');

    // 验证 workerSrc 被正确设置
    expect(GlobalWorkerOptions.workerSrc).toBe('mocked-worker-url');
  });

  it('不应该重新设置 GlobalWorkerOptions.workerSrc 当它已经有值时', () => {
    // 预先设置 workerSrc
    GlobalWorkerOptions.workerSrc = 'existing-worker-url';

    // 调用初始化函数
    initPdfJsWorker();

    // 验证 generatePdfAssetsUrl 没有被调用
    expect(generatePdfAssetsUrl).not.toHaveBeenCalled();

    // 验证 workerSrc 保持不变
    expect(GlobalWorkerOptions.workerSrc).toBe('existing-worker-url');
  });
});
