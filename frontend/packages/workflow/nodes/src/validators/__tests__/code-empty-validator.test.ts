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

import { describe, test, expect, vi } from 'vitest';
import { I18n } from '@coze-arch/i18n';

import { codeEmptyValidator } from '../code-empty-validator';

// Simulation I18n.t method
vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn(key => `translated_${key}`) },
}));

describe('codeEmptyValidator', () => {
  test('当value.code存在时返回true', () => {
    const result = codeEmptyValidator({ value: { code: 'some code' } });
    expect(result).toBe(true);
  });

  test('当value.code不存在时返回翻译后的错误信息', () => {
    const result = codeEmptyValidator({ value: {} });
    expect(I18n.t).toHaveBeenCalledWith('workflow_running_results_error_code');
    expect(result).toBe('translated_workflow_running_results_error_code');
  });
});
