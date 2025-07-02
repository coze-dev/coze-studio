import { type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useUIModal } from '@coze-arch/bot-semi';

vi.mock('@coze-arch/bot-semi', () => ({
  useUIModal: vi.fn(),
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));

import { useMobileTips } from '../src/hooks';

describe('useMobileTips', () => {
  test('should return correctly', () => {
    const mockOpen = vi.fn();
    const mockClose = vi.fn();
    const mockModal = vi.fn().mockReturnValue({ test: 'foo' });

    (useUIModal as Mock).mockReturnValue({
      open: mockOpen,
      close: mockClose,
      modal: mockModal,
    });

    const { result } = renderHook(() => useMobileTips());
    expect(useUIModal).toBeCalled();
    useUIModal.mock.calls[0][0].onOk();
    expect(mockClose).toBeCalled();

    expect(typeof result.current.open).toEqual('function');
    expect(typeof result.current.close).toEqual('function');
    expect(mockModal).toBeCalled();
    const contentShape = mockModal.mock.calls[0][0];
    expect(contentShape.props.className).toContain('mobile-tips-span');
    expect(result.current.node).toEqual({ test: 'foo' });

    expect(mockOpen).not.toBeCalled();
    result.current.open();
    expect(mockOpen).toBeCalled();

    result.current.close();
    expect(mockClose).toBeCalledTimes(2);
  });
});
