import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { generatePdfAssetsUrl } from '../src/generate-assets';
import pkg from '../package.json';

describe('generatePdfAssetsUrl', () => {
  const originalRegion = global.REGION;

  beforeEach(() => {
    // 重置模拟
    vi.resetAllMocks();
  });

  afterEach(() => {
    // 恢复原始 REGION 值
    global.REGION = originalRegion;
  });

  it('应该为 cmaps 生成正确的 URL（中国区域）', () => {
    // 设置区域为中国
    global.REGION = 'cn';

    const url = generatePdfAssetsUrl('cmaps');

    // 验证 URL 格式
    expect(url).toContain('//lf-cdn.coze.cn/obj/unpkg');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/cmaps/');
  });

  it('应该为 pdf.worker 生成正确的 URL（中国区域）', () => {
    // 设置区域为中国
    global.REGION = 'cn';

    const url = generatePdfAssetsUrl('pdf.worker');

    // 验证 URL 格式
    expect(url).toContain('//lf-cdn.coze.cn/obj/unpkg');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/worker.js');
  });

  it('应该为 cmaps 生成正确的 URL（国际区域）', () => {
    // 设置区域为国际
    global.REGION = 'va';

    const url = generatePdfAssetsUrl('cmaps');

    // 验证 URL 格式
    expect(url).toContain('//sf-cdn.coze.com/obj/unpkg-va');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/cmaps/');
  });

  it('应该为 pdf.worker 生成正确的 URL（国际区域）', () => {
    // 设置区域为国际
    global.REGION = 'va';

    const url = generatePdfAssetsUrl('pdf.worker');

    // 验证 URL 格式
    expect(url).toContain('//sf-cdn.coze.com/obj/unpkg-va');
    expect(url).toContain(pkg.name.replace(/^@/, ''));
    expect(url).toContain('lib/worker.js');
  });

  it('应该在传入无效资源类型时抛出错误', () => {
    // 使用类型断言来测试错误情况
    expect(() => generatePdfAssetsUrl('invalid' as any)).toThrow(
      '目前只支持引用 cmaps 与 pdf.worker 文件',
    );
  });
});
