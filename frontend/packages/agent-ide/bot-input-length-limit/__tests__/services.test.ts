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

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  type BotInputLengthConfig,
  type WorkInfoOnboardingContent,
} from '../src/services/type';
import { BotInputLengthService, botInputLengthService } from '../src/services';

// Analog SuggestedQuestionsShowMode Enumeration
enum SuggestedQuestionsShowMode {
  Random = 0,
  All = 1,
}

// simulation configuration
const mockConfig: BotInputLengthConfig = {
  botName: 10,
  botDescription: 100,
  onboarding: 50,
  onboardingSuggestion: 20,
  suggestionPrompt: 200,
  projectName: 10,
  projectDescription: 100,
};

// Function to simulate acquisition configuration
const mockGetConfig = vi.fn().mockReturnValue(mockConfig);

describe('BotInputLengthService', () => {
  let service: BotInputLengthService;

  beforeEach(() => {
    // Reset simulation
    vi.clearAllMocks();
    // Create a service instance
    service = new BotInputLengthService(mockGetConfig);
  });

  describe('getInputLengthLimit', () => {
    it('应该返回指定字段的长度限制', () => {
      expect(service.getInputLengthLimit('botName')).toBe(10);
      expect(service.getInputLengthLimit('botDescription')).toBe(100);
      expect(service.getInputLengthLimit('onboarding')).toBe(50);
      expect(service.getInputLengthLimit('onboardingSuggestion')).toBe(20);
      expect(service.getInputLengthLimit('suggestionPrompt')).toBe(200);
      expect(service.getInputLengthLimit('projectName')).toBe(10);
      expect(service.getInputLengthLimit('projectDescription')).toBe(100);

      // Verify that the configuration get function is called
      expect(mockGetConfig).toHaveBeenCalledTimes(7);
    });
  });

  describe('getValueLength', () => {
    it('应该返回字符串的字形簇数量', () => {
      // Normal string
      expect(service.getValueLength('hello')).toBe(5);

      // A string containing the emoji (the emoji counts as a glyph cluster)
      expect(service.getValueLength('hi😊')).toBe(3);

      // A string containing combined characters
      expect(service.getValueLength('café')).toBe(4);

      // empty string
      expect(service.getValueLength('')).toBe(0);

      // undefined
      expect(service.getValueLength(undefined)).toBe(0);
    });
  });

  describe('sliceStringByMaxLength', () => {
    it('应该根据字段限制截取字符串', () => {
      // String length less than limit
      expect(
        service.sliceStringByMaxLength({ value: 'hello', field: 'botName' }),
      ).toBe('hello');

      // String length equals limit
      expect(
        service.sliceStringByMaxLength({
          value: '1234567890',
          field: 'botName',
        }),
      ).toBe('1234567890');

      // String length is greater than limit
      expect(
        service.sliceStringByMaxLength({
          value: '12345678901234567890',
          field: 'botName',
        }),
      ).toBe('1234567890');

      // A string containing emoji
      expect(
        service.sliceStringByMaxLength({
          value: 'hello😊world',
          field: 'botName',
        }),
      ).toBe('hello😊worl');

      // Verify that the configuration get function is called
      expect(mockGetConfig).toHaveBeenCalledTimes(4);
    });
  });

  describe('sliceWorkInfoOnboardingByMaxLength', () => {
    it('应该截取工作信息的开场白和建议问题', () => {
      const workInfo: WorkInfoOnboardingContent = {
        prologue:
          'This is a very long prologue that exceeds the limit of 50 characters and should be truncated',
        suggested_questions: [
          {
            id: '1',
            content:
              'This is a very long suggested question that exceeds the limit',
            highlight: true,
          },
          { id: '2', content: 'Short question' },
          {
            id: '3',
            content:
              'Another very long suggested question that should be truncated',
            highlight: false,
          },
        ],
        suggested_questions_show_mode: SuggestedQuestionsShowMode.All,
      };

      const result = service.sliceWorkInfoOnboardingByMaxLength(workInfo);

      // Verify that the opening statement was intercepted
      expect(result.prologue).toBe(
        'This is a very long prologue that exceeds the limi',
      );
      expect(result.prologue.length).toBeLessThanOrEqual(50);

      // Validation suggestion problem intercepted
      expect(result.suggested_questions[0]?.content).toBe(
        'This is a very long ',
      );
      expect(result.suggested_questions[0]?.content.length).toBeLessThanOrEqual(
        20,
      );
      expect(result.suggested_questions[0]?.id).toBe('1');
      expect(result.suggested_questions[0]?.highlight).toBe(true);

      expect(result.suggested_questions[1]?.content).toBe('Short question');
      expect(result.suggested_questions[1]?.id).toBe('2');

      expect(result.suggested_questions[2]?.content).toBe(
        'Another very long su',
      );
      expect(result.suggested_questions[2]?.content.length).toBeLessThanOrEqual(
        20,
      );
      expect(result.suggested_questions[2]?.id).toBe('3');
      expect(result.suggested_questions[2]?.highlight).toBe(false);

      // Verify that the display mode remains unchanged
      expect(result.suggested_questions_show_mode).toBe(
        SuggestedQuestionsShowMode.All,
      );
    });

    it('应该处理空的工作信息', () => {
      const workInfo: WorkInfoOnboardingContent = {
        prologue: '',
        suggested_questions: [],
        suggested_questions_show_mode: SuggestedQuestionsShowMode.Random,
      };

      const result = service.sliceWorkInfoOnboardingByMaxLength(workInfo);

      expect(result.prologue).toBe('');
      expect(result.suggested_questions).toEqual([]);
      expect(result.suggested_questions_show_mode).toBe(
        SuggestedQuestionsShowMode.Random,
      );
    });
  });
});

// Test Exported Singletons
describe('botInputLengthService', () => {
  it('应该导出一个 BotInputLengthService 的实例', () => {
    // Verify that the exported singleton is an instance of BotInputLengthService
    expect(botInputLengthService).toBeInstanceOf(BotInputLengthService);
  });
});
