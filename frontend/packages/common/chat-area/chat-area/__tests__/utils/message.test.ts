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

import { isFallbackErrorMessage } from '../../src/utils/message';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('@coze-arch/coze-design', () => ({
  UIToast: {
    error: vi.fn(),
  },
  Avatar: vi.fn(),
}));

describe('isFallbackErrorMessage', () => {
  it('should return true for fallback error messages', () => {
    const message = {
      message_id: '7486354676263567404_error',
    };
    expect(isFallbackErrorMessage(message)).toBe(true);
  });
  it('should return false for fallback error messages', () => {
    const message = {
      message_id: '74863546762635asdasv',
    };
    expect(isFallbackErrorMessage(message)).toBe(false);
  });
});
