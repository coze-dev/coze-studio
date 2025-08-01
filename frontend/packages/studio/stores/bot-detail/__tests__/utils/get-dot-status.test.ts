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

import { DotStatus } from '../../src/types/generate-image';

// Analog PicType Enumeration
enum MockPicType {
  AVATAR = 1,
  BACKGROUND = 2,
}

// Emulate the GetPicTaskData type
interface MockTask {
  type: MockPicType;
  status: number;
}

interface MockNotice {
  type: MockPicType;
  un_read: boolean;
}

interface MockGetPicTaskData {
  tasks?: MockTask[];
  notices?: MockNotice[];
}

// Simplified version of getDotStatus function
function simplifiedGetDotStatus(
  data: MockGetPicTaskData | null,
  picType: MockPicType,
): number {
  if (!data) {
    return DotStatus.None;
  }

  const { notices = [], tasks = [] } = data;
  const task = tasks.find(item => item.type === picType);

  return task?.status === DotStatus.Generating ||
    notices.some(item => item.type === picType && item.un_read)
    ? task?.status ?? DotStatus.None
    : DotStatus.None;
}

describe('getDotStatus', () => {
  it('应该返回正在生成状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [
        {
          type: MockPicType.AVATAR,
          status: DotStatus.Generating,
        },
      ],
      notices: [],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.Generating);
  });

  it('应该返回未读通知状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [
        {
          type: MockPicType.AVATAR,
          status: DotStatus.None,
        },
      ],
      notices: [
        {
          type: MockPicType.AVATAR,
          un_read: true,
        },
      ],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });

  it('当没有任务和通知时应该返回 None 状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [],
      notices: [],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });

  it('当任务类型不匹配时应该返回 None 状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [
        {
          type: MockPicType.BACKGROUND,
          status: DotStatus.Generating,
        },
      ],
      notices: [],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });

  it('当通知类型不匹配时应该返回 None 状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [],
      notices: [
        {
          type: MockPicType.BACKGROUND,
          un_read: true,
        },
      ],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });

  it('当通知未读状态为 false 时应该返回 None 状态', () => {
    const data: MockGetPicTaskData = {
      tasks: [],
      notices: [
        {
          type: MockPicType.AVATAR,
          un_read: false,
        },
      ],
    };

    const result = simplifiedGetDotStatus(data, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });

  it('当数据为空时应该返回 None 状态', () => {
    const result = simplifiedGetDotStatus(null, MockPicType.AVATAR);

    expect(result).toBe(DotStatus.None);
  });
});
