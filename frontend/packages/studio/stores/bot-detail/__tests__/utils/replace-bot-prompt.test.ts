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

import { describe, it, expect } from 'vitest';
import { PromptType } from '@coze-arch/bot-api/developer_api';

import { replacedBotPrompt } from '../../src/utils/replace-bot-prompt';

describe('replacedBotPrompt', () => {
  it('应该正确转换提示数据', () => {
    const inputData = {
      data: '这是一个系统提示',
      record_id: '123456',
    };

    const result = replacedBotPrompt(inputData);

    expect(result).toHaveLength(3);

    // Check system prompt
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '这是一个系统提示',
      record_id: '123456',
    });

    // Check user prefix
    expect(result[1]).toEqual({
      prompt_type: PromptType.USERPREFIX,
      data: '',
    });

    // Check user suffix
    expect(result[2]).toEqual({
      prompt_type: PromptType.USERSUFFIX,
      data: '',
    });
  });

  it('应该处理空数据', () => {
    const inputData = {
      data: '',
      record_id: '',
    };

    const result = replacedBotPrompt(inputData);

    expect(result).toHaveLength(3);

    // Check system prompt
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '',
      record_id: '',
    });

    // Check user prefix
    expect(result[1]).toEqual({
      prompt_type: PromptType.USERPREFIX,
      data: '',
    });

    // Check user suffix
    expect(result[2]).toEqual({
      prompt_type: PromptType.USERSUFFIX,
      data: '',
    });
  });

  it('应该处理缺少 record_id 的情况', () => {
    const inputData = {
      data: '这是一个系统提示',
    };

    const result = replacedBotPrompt(inputData);

    expect(result).toHaveLength(3);

    // Check system prompt
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '这是一个系统提示',
      record_id: undefined,
    });
  });
});
