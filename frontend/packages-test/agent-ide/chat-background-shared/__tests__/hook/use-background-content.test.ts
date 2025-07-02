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
