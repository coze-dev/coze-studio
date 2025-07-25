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
