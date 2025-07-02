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

    // 检查系统提示
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '这是一个系统提示',
      record_id: '123456',
    });

    // 检查用户前缀
    expect(result[1]).toEqual({
      prompt_type: PromptType.USERPREFIX,
      data: '',
    });

    // 检查用户后缀
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

    // 检查系统提示
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '',
      record_id: '',
    });

    // 检查用户前缀
    expect(result[1]).toEqual({
      prompt_type: PromptType.USERPREFIX,
      data: '',
    });

    // 检查用户后缀
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

    // 检查系统提示
    expect(result[0]).toEqual({
      prompt_type: PromptType.SYSTEM,
      data: '这是一个系统提示',
      record_id: undefined,
    });
  });
});
