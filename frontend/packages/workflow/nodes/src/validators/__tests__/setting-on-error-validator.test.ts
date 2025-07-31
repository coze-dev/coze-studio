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

import { describe, it, expect, vi } from 'vitest';

import { settingOnErrorValidator } from '../setting-on-error-validator';

vi.mock('@flowgram-adapter/free-layout-editor', () => ({}));

vi.mock('../setting-on-error', () => ({
  SettingOnErrorProcessType: {
    STOP: 1,
    RETURN: 2,
    BACKUP: 3,
  },
}));

// Mock I18n.t
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => key),
  },
}));

describe('settingOnErrorValidator', () => {
  it('should return true if value is undefined', () => {
    expect(settingOnErrorValidator({ value: undefined } as any)).toBe(true);
  });

  it('should return true if value is null', () => {
    expect(settingOnErrorValidator({ value: null } as any)).toBe(true);
  });

  it('should return true if settingOnErrorIsOpen is false', () => {
    const value = {
      settingOnErrorIsOpen: false,
      settingOnErrorJSON: '{"key":"value"}',
      processType: 1,
    };
    expect(settingOnErrorValidator({ value } as any)).toBe(true);
  });

  it('should return true if settingOnErrorIsOpen is not presented', () => {
    const value = {
      processType: 1,
      timeoutMs: 180000,
      retryTimes: 0,
    };
    expect(settingOnErrorValidator({ value } as any)).toBe(true);
  });

  it('should return true if settingOnErrorIsOpen is not presented, and selected a backup model', () => {
    const value = {
      processType: 1,
      timeoutMs: 180000,
      retryTimes: 1,
      ext: {
        backupLLmParam: {
          temperature: '1',
          maxTokens: '2200',
          responseFormat: 2,
          modelName: 'DeepSeek-R1/250528',
          modelType: 1748588801,
          generationDiversity: 'default_val',
        },
      },
    };
    expect(settingOnErrorValidator({ value } as any)).toBe(true);
  });

  it('should return error string if settingOnErrorIsOpen is true, processType is RETURN, and settingOnErrorJSON is invalid JSON', () => {
    const value = {
      settingOnErrorIsOpen: true,
      settingOnErrorJSON: 'invalid-json',
      processType: 2,
      timeoutMs: 180000,
      retryTimes: 1,
      ext: {
        backupLLmParam: {
          temperature: '1',
          maxTokens: '2200',
          responseFormat: 2,
          modelName: 'DeepSeek-R1/250528',
          modelType: 1748588801,
          generationDiversity: 'default_val',
        },
      },
    };
    const result = settingOnErrorValidator({ value } as any);
    expect(result).toBeTypeOf('string');
    if (typeof result === 'string') {
      const parsedResult = JSON.parse(result);
      expect(parsedResult.issues[0].message).toBe(
        'workflow_exception_ignore_json_error',
      );
    }
  });

  it('should return error string if settingOnErrorIsOpen is true, processType is RETURN, and settingOnErrorJSON is valid JSON', () => {
    const value = {
      settingOnErrorIsOpen: true,
      settingOnErrorJSON: '{\n    "output": "hello"\n}',
      processType: 2,
      timeoutMs: 180000,
      retryTimes: 1,
      ext: {
        backupLLmParam: {
          temperature: '1',
          maxTokens: '2200',
          responseFormat: 2,
          modelName: 'DeepSeek-R1/250528',
          modelType: 1748588801,
          generationDiversity: 'default_val',
        },
      },
    };
    const result = settingOnErrorValidator({ value } as any);
    expect(result).toBe(true);
  });
});
