import { vi } from 'vitest';

// 定义一个模拟的 Worker 类
class MockWorker {
  constructor(
    public scriptURL: string,
    public options: any,
  ) {}

  // 添加 Worker 接口所需的方法
  terminate(): void {
    // 空实现
  }

  postMessage(): void {
    // 空实现
  }

  onmessage = null;
  onmessageerror = null;
}

// 全局模拟
global.Worker = MockWorker as any;
global.URL = {
  createObjectURL: vi.fn().mockReturnValue('blob:mocked-object-url'),
} as any;

global.Blob = class MockBlob {
  constructor(
    public array: any[],
    public options: any,
  ) {}
} as any;

global.location = {
  origin: 'https://example.com',
} as any;
