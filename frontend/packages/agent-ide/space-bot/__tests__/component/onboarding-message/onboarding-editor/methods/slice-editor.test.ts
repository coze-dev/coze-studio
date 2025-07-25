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
 
import { sliceEditor } from '@/component/onboarding-message/onboarding-editor/method/slice-editor';

// vi.mock需要在顶部，因为它会被提升
vi.mock('@coze-common/md-editor-adapter', () => ({
  ZoneDelta: vi.fn().mockImplementation(() => ({
    retain: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  })),
}));

// 导入模拟后的ZoneDelta
import { ZoneDelta } from '@coze-common/md-editor-adapter';

describe('sliceEditor', () => {
  let editorRef;
  let maxCount;
  let mockedEditor;
  let mockZoneDeltaInstance;

  beforeEach(() => {
    vi.resetAllMocks();

    // 创建一个新的模拟实例
    mockZoneDeltaInstance = {
      retain: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    // 重置ZoneDelta构造函数的实现
    vi.mocked(ZoneDelta).mockImplementation(() => mockZoneDeltaInstance);

    mockedEditor = {
      selection: {
        getSelection: vi.fn(),
      },
      getContentState: vi.fn().mockReturnValue({
        getZoneState: vi.fn(),
        apply: vi.fn(),
      }),
    };
    editorRef = { current: mockedEditor };
    maxCount = 5;
  });

  it('returns early when editorRef is not current', () => {
    editorRef.current = null;

    const result = sliceEditor(editorRef, maxCount);

    expect(result).toBeUndefined();
  });

  it('returns early when zoneState is not found', () => {
    mockedEditor.selection.getSelection.mockReturnValue({
      start: { zoneId: 'zone1' },
    });
    mockedEditor.getContentState.mockReturnValue({
      getZoneState: vi.fn().mockReturnValue(null),
    });

    const result = sliceEditor(editorRef, maxCount);

    expect(result).toBeUndefined();
  });

  it('does not slice when currentCount is less than maxCount', () => {
    mockedEditor.selection.getSelection.mockReturnValue({
      start: { zoneId: 'zone1' },
    });
    mockedEditor.getContentState.mockReturnValue({
      getZoneState: vi
        .fn()
        .mockReturnValue({ totalWidth: vi.fn().mockReturnValue(4) }),
    });

    const result = sliceEditor(editorRef, maxCount);

    expect(result).toBeUndefined();
  });

  it('slices when currentCount is more than maxCount', () => {
    const mockApply = vi.fn();
    mockedEditor.selection.getSelection.mockReturnValue({
      start: { zoneId: 'zone1' },
    });
    mockedEditor.getContentState.mockReturnValue({
      apply: mockApply,
      getZoneState: vi
        .fn()
        .mockReturnValue({ totalWidth: vi.fn().mockReturnValue(7) }),
    });

    sliceEditor(editorRef, maxCount);

    expect(ZoneDelta).toHaveBeenCalledWith({ zoneId: 'zone1' });
    expect(mockZoneDeltaInstance.retain).toHaveBeenCalledWith(maxCount);
    expect(mockZoneDeltaInstance.delete).toHaveBeenCalledWith(1); // 实际计算出的值是1
    expect(mockApply).toHaveBeenCalled();
  });
});
