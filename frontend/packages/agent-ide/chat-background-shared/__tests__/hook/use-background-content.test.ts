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

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  DotStatus,
  useGenerateImageStore,
} from '@coze-studio/bot-detail-store';

import { useBackgroundContent } from '../../src/hooks/use-background-content';

vi.mock('@coze-studio/bot-detail-store', () => ({
  useGenerateImageStore: vi.fn(),
  DotStatus: vi.fn(),
}));
vi.mock('@coze-studio/bot-detail-store', () => ({
  useGenerateImageStore: vi.fn(),
  DotStatus: vi.fn(),
}));
vi.mock('@coze-studio/components', () => ({
  GenerateType: vi.fn(),
}));
vi.mock('@coze-studio/bot-detail-store/bot-info', () => ({
  useBotInfoStore: vi.fn(),
}));
vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    CancelGenerateGif: vi.fn().mockResolvedValueOnce({
      code: 0,
    }),
    MarkReadNotice: vi.fn().mockResolvedValueOnce({
      code: 0,
    }),
  },
}));

describe('useBackgroundContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const openConfig = vi.fn();

  (useBotInfoStore as unknown as Mock).mockReturnValue('xxx');
  it('handleEdit should call openConfig', () => {
    (useGenerateImageStore as unknown as Mock).mockReturnValue({
      imageDotStatus: DotStatus.None,
      gifDotStatus: DotStatus.None,
    });
    DotStatus;
    const { result } = renderHook(() => useBackgroundContent({ openConfig }));
    const { handleEdit } = result.current;
    handleEdit();
    expect(openConfig).toHaveBeenCalled();
  });

  it('showDot & showDotStatus', () => {
    const { result } = renderHook(() => useBackgroundContent({ openConfig }));
    const { showDotStatus, showDot } = result.current;
    (useGenerateImageStore as unknown as Mock).mockReturnValueOnce({
      imageDotStatus: DotStatus.None,
      gifDotStatus: DotStatus.None,
      setGenerateBackgroundModalByImmer: vi.fn(),
    });
    expect(showDotStatus).toBe(DotStatus.None);
    expect(showDot).toBe(false);
  });
});
