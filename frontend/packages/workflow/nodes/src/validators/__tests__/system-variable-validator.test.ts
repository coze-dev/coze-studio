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
import { I18n } from '@coze-arch/i18n';

import { systemVariableValidator } from '../system-variable-validator';

// Mock I18n
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => {
      if (key === 'variable_240416_01') {
        return 'System variables cannot start with sys_';
      }
      return `translated_${key}`;
    }),
  },
}));

const mockContext = {} as any; // ValidatorProps context is not used by this validator

describe('systemVariableValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for a valid variable name', () => {
    const result = systemVariableValidator({
      value: 'my_variable',
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return true for a variable name with leading/trailing spaces that is otherwise valid', () => {
    const result = systemVariableValidator({
      value: '  my_variable  ',
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return an error message for a variable name starting with "sys_"', () => {
    const result = systemVariableValidator({
      value: 'sys_variable',
      context: mockContext,
      options: {},
    });
    expect(result).toBe('System variables cannot start with sys_');
    expect(I18n.t).toHaveBeenCalledWith('variable_240416_01');
  });

  it('should return an error message for a variable name starting with "sys_" even with leading/trailing spaces', () => {
    const result = systemVariableValidator({
      value: '  sys_variable  ',
      context: mockContext,
      options: {},
    });
    expect(result).toBe('System variables cannot start with sys_');
    expect(I18n.t).toHaveBeenCalledWith('variable_240416_01');
  });

  it('should return true for an empty string after trimming', () => {
    const result = systemVariableValidator({
      value: '   ',
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return true for an empty string input', () => {
    const result = systemVariableValidator({
      value: '',
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return true for a null input value', () => {
    const result = systemVariableValidator({
      value: null as any,
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });

  it('should return true for an undefined input value', () => {
    const result = systemVariableValidator({
      value: undefined as any,
      context: mockContext,
      options: {},
    });
    expect(result).toBe(true);
  });
});
