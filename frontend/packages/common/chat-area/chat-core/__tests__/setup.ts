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

import eventEmitter from 'eventemitter3';

vi.stubGlobal('IS_OVERSEA', false);
vi.spyOn(global.URL, 'createObjectURL').mockImplementation(() => 'mocked URL');
// global.File = class MockFile {
//   filename: string;
//   constructor(
//     parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
//     filename: string,
//     properties?: FilePropertyBag,
//   ) {
//     this.filename = filename;
//   }
// };

export const testSetup = () => {
  vi.mock('../src/report-log', () => ({
    ReportLog: vi.fn().mockImplementation(() => ({
      init: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      slardarInfo: vi.fn(),
      slardarSuccess: vi.fn(),
      slardarError: vi.fn(),
      slardarEvent: vi.fn(),
      slardarErrorEvent: vi.fn(),
      slardarTracer: vi.fn(),
      createLoggerWith: () => ({
        slardarEvent: vi.fn(),
        init: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        slardarInfo: vi.fn(),
        slardarSuccess: vi.fn(),
        slardarError: vi.fn(),
        slardarErrorEvent: vi.fn(),
        slardarTracer: vi.fn(),
      }),
    })),
  }));
  // Mock upload plugin implementation
  vi.mock('../src/plugins/upload-plugin', () => ({
    ChatCoreUploadPlugin: class {
      eventBus = new eventEmitter();
      on(event: string, fn: () => void) {
        this.eventBus.on(event, fn);
      }
      emit(event: string, data: unknown) {
        this.eventBus.emit(event, data);
      }
    },
  }));
};
