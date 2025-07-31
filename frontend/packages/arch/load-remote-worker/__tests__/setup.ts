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

// Define a simulated Worker class
class MockWorker {
  constructor(public scriptURL: string, public options: any) {}

  // Methods required to add a Worker interface
  terminate(): void {
    // empty implementation
  }

  postMessage(): void {
    // empty implementation
  }

  onmessage = null;
  onmessageerror = null;
}

// global simulation
global.Worker = MockWorker as any;
global.URL = {
  createObjectURL: vi.fn().mockReturnValue('blob:mocked-object-url'),
} as any;

global.Blob = class MockBlob {
  constructor(public array: any[], public options: any) {}
} as any;

global.location = {
  origin: 'https://example.com',
} as any;
