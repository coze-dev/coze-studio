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

import { shouldCloseConsole } from '../src/console-disable';

describe('shouldCloseConsole', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test('URL search can control the result', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => false,
      setItem: vi.fn(),
    });
    vi.stubGlobal('IS_RELEASE_VERSION', true);
    vi.stubGlobal('IS_PROD', true);

    vi.stubGlobal('window', {
      location: { search: '' },
      gfdatav1: {
        canary: 0,
      },
    });
    expect(shouldCloseConsole()).equal(true);
    vi.stubGlobal('window', { location: { search: '?open_debug=true' } });
    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('window', {
      location: { search: '?test=a&open_debug=true' },
    });
    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('sessionStorage', {
      getItem: () => true,
      setItem: vi.fn(),
    });
    vi.stubGlobal('window', { location: { search: '' } });
    expect(shouldCloseConsole()).equal(false);
  });

  test('Production mode should return true', () => {
    vi.stubGlobal('IS_PROD', true);
    vi.stubGlobal('window', {
      location: { search: '?test=a' },
      gfdatav1: {
        canary: 0,
      },
    });
    vi.stubGlobal('IS_RELEASE_VERSION', false);
    expect(shouldCloseConsole()).equal(false);

    vi.stubGlobal('IS_RELEASE_VERSION', true);
    expect(shouldCloseConsole()).equal(true);

    vi.stubGlobal('IS_RELEASE_VERSION', false);

    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('window', {
      location: { search: '?test=a&&open_debug=true' },
      gfdatav1: {
        canary: 0,
      },
    });
    vi.stubGlobal('IS_RELEASE_VERSION', true);

    expect(shouldCloseConsole()).equal(false);
  });
});
