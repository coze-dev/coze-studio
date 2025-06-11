import { describe, it, expect, vi } from 'vitest';

// 模拟 pdfjs-dist 模块
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
}));

// 模拟 generate-assets 和 init-pdfjs-dist 模块
vi.mock('../src/generate-assets', () => ({
  generatePdfAssetsUrl: vi.fn(),
}));

vi.mock('../src/init-pdfjs-dist', () => ({
  initPdfJsWorker: vi.fn(),
}));

// 导入被测试的模块
import {
  generatePdfAssetsUrl,
  initPdfJsWorker,
  getDocument,
} from '../src/index';

describe('pdfjs-shadow index', () => {
  it('应该导出所有必要的函数和类型', () => {
    // 验证导出的函数
    expect(typeof generatePdfAssetsUrl).toBe('function');
    expect(typeof initPdfJsWorker).toBe('function');

    // 验证从 pdfjs-dist 重新导出的函数和类型
    expect(getDocument).toBeDefined();
  });
});
