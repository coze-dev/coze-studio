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
