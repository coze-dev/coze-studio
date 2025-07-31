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

import { ZodIssueCode } from 'zod';
import { describe, it, vi, expect } from 'vitest';

import { questionOptionValidator } from '../question-option-validator';

// Simulation I18n.t method
vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn(key => `translated_${key}`) },
}));

describe('questionOptionValidator', () => {
  it('should return true for a valid non-empty unique array', () => {
    const value = [
      { name: 'Option 1', id: '1' },
      { name: 'Option 2', id: '2' },
    ];
    expect(
      questionOptionValidator({ value, context: {} as any, options: {} }),
    ).toBe(true);
  });

  it('should return true for an empty array', () => {
    const value: Array<{ name?: string; id: string }> = [];
    expect(
      questionOptionValidator({ value, context: {} as any, options: {} }),
    ).toBe(true);
  });

  it('should return error JSON for array with empty name', () => {
    const value = [
      { name: 'Option 1', id: '1' },
      { name: '', id: '2' },
    ];
    const result = questionOptionValidator({
      value,
      context: {} as any,
      options: {},
    });
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.custom,
          message: 'translated_workflow_ques_option_notempty',
          path: [1],
        }),
      ]),
    );
  });

  it('should return error JSON for array with whitespace name', () => {
    const value = [
      { name: 'Option 1', id: '1' },
      { name: '   ', id: '2' },
    ];
    const result = questionOptionValidator({
      value,
      context: {} as any,
      options: {},
    });
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.custom,
          message: 'translated_workflow_ques_option_notempty',
          path: [1],
        }),
      ]),
    );
  });

  it('should return error JSON for array with duplicate names', () => {
    const value = [
      { name: 'Option 1', id: '1' },
      { name: 'Option 1', id: '2' },
    ];
    const result = questionOptionValidator({
      value,
      context: {} as any,
      options: {},
    });
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.custom,
          message: 'translated_workflow_ques_ans_testrun_dulpicate',
          path: [1],
        }),
      ]),
    );
  });

  it('should return error JSON for array with both empty and duplicate names', () => {
    const value = [
      { name: 'Option 1', id: '1' },
      { name: '', id: '2' },
      { name: 'Option 1', id: '3' },
    ];
    const result = questionOptionValidator({
      value,
      context: {} as any,
      options: {},
    });
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.custom,
          message: 'translated_workflow_ques_option_notempty',
          path: [1],
        }),
        expect.objectContaining({
          code: ZodIssueCode.custom,
          message: 'translated_workflow_ques_ans_testrun_dulpicate',
          path: [2],
        }),
      ]),
    );
  });

  it('should return error JSON when value is undefined', () => {
    const value = undefined;
    const result = questionOptionValidator({
      value: value as any,
      context: {} as any,
      options: {},
    }); // Cast to any to bypass TS check for test
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    // Zod will throw a different type of error for undefined input on a non-optional schema
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.invalid_type,
          expected: 'array',
          received: 'undefined',
        }),
      ]),
    );
  });

  it('should return error JSON when value is null', () => {
    const value = null;
    const result = questionOptionValidator({
      value: value as any,
      context: {} as any,
      options: {},
    }); // Cast to any to bypass TS check for test
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.invalid_type,
          expected: 'array',
          received: 'null',
        }),
      ]),
    );
  });

  it('should return error JSON for array with name missing (undefined)', () => {
    const value = [{ id: '1' }, { name: 'Option 2', id: '2' }]; // name is undefined for the first item
    const result = questionOptionValidator({
      value: value as any,
      context: {} as any,
      options: {},
    });
    expect(typeof result).toBe('string');
    const errors = JSON.parse(result as string);
    expect(errors.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: ZodIssueCode.invalid_type, // Zod expects a string for name
          expected: 'string',
          received: 'undefined',
          path: [0, 'name'],
        }),
      ]),
    );
  });
});
