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

import { vi, beforeEach, describe, it, expect } from 'vitest';
import { logger } from '@coze-arch/logger';

import {
  sendTeaEvent,
  initBotLandingPageUrl,
  getBotLandingPageUrl,
  LANDING_PAGE_URL_KEY,
} from '../src';

vi.mock('@coze-arch/tea', () => ({
  default: {
    sendEvent: vi.fn(),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('bot-tea', () => {
  const mockLocation = 'https://example.com/test';
  const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: mockLocation },
      writable: true,
    });
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
    });
  });

  describe('landing page URL', () => {
    it('should initialize landing page URL if not exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      initBotLandingPageUrl();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        LANDING_PAGE_URL_KEY,
        mockLocation,
      );
    });

    it('should not initialize landing page URL if already exists', () => {
      const existingUrl = 'https://example.com/existing';
      mockSessionStorage.getItem.mockReturnValue(existingUrl);

      initBotLandingPageUrl();

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should get landing page URL from session storage', () => {
      const savedUrl = 'https://example.com/saved';
      mockSessionStorage.getItem.mockReturnValue(savedUrl);

      const result = getBotLandingPageUrl();

      expect(result).toBe(savedUrl);
    });

    it('should fallback to current location if no saved URL', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const result = getBotLandingPageUrl();

      expect(result).toBe(mockLocation);
    });
  });

  describe('sendTeaEvent', () => {
    const mockEvent = 'test_event' as any;
    const mockParams = { foo: 'bar' };

    it('should send event with UG params when FEATURE_ENABLE_TEA_UG is true', () => {
      // @ts-expect-error - simulate global variables
      window.FEATURE_ENABLE_TEA_UG = true;
      const savedUrl = 'https://example.com/saved';
      mockSessionStorage.getItem.mockReturnValue(savedUrl);

      sendTeaEvent(mockEvent, mockParams);

      expect(logger.info).toHaveBeenCalledWith({
        message: 'send-tea-event',
        meta: {
          event: mockEvent,
          params: {
            LandingPageUrl: savedUrl,
            AppId: 510023,
            EventName: mockEvent,
            growth_deepevent: '4',
            foo: 'bar',
            EventTs: expect.any(Number),
          },
        },
      });
    });

    it('should send event without UG params when FEATURE_ENABLE_TEA_UG is false', () => {
      // @ts-expect-error - simulate global variables
      window.FEATURE_ENABLE_TEA_UG = false;

      sendTeaEvent(mockEvent, mockParams);

      expect(logger.info).toHaveBeenCalledWith({
        message: 'send-tea-event',
        meta: {
          event: mockEvent,
          params: mockParams,
        },
      });
    });

    it('should handle undefined params', () => {
      // @ts-expect-error - simulate global variables
      window.FEATURE_ENABLE_TEA_UG = false;

      sendTeaEvent(mockEvent);

      expect(logger.info).toHaveBeenCalledWith({
        message: 'send-tea-event',
        meta: {
          event: mockEvent,
          params: undefined,
        },
      });
    });
  });
});
