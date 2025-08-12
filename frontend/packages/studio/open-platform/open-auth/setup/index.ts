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

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));
vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    createLoggerWith: vi.fn(() => ({
      info: vi.fn(),
      persist: {
        error: vi.fn(),
      },
    })),
  },
  reporter: {
    errorEvent: vi.fn(),
    info: vi.fn(),
  },
}));

vi.stubGlobal('IS_OVERSEA', false);
vi.stubGlobal('IS_DEV_MODE', true);
vi.stubGlobal('IS_BOE', true);
