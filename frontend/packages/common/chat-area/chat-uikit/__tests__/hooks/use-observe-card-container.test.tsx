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

import mitt from 'mitt';
import {
  renderHook,
  type WrapperComponent,
} from '@testing-library/react-hooks';
import {
  UIKitEvents,
  UIKitEventContext,
  type UIKitEventMap,
} from '@coze-common/chat-uikit-shared';

import { useObserveCardContainer } from '../../src/hooks/use-observe-card-container';

const disconnectFn = vi.fn();
const initFn = vi.fn();
const observeFn = vi.fn();

const ResizeObserverMock = vi.fn((fn: any) => {
  initFn();
  fn();

  return {
    disconnect: disconnectFn,
    observe: observeFn,
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  };
});

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
vi.useFakeTimers();

describe('use-observe-card', () => {
  it('should call correctly', () => {
    const eventCenter = mitt<UIKitEventMap>();
    const onResize = vi.fn();
    const wrapper: WrapperComponent<{
      children: any;
    }> = ({ children }) => (
      <UIKitEventContext.Provider value={eventCenter}>
        {children}
      </UIKitEventContext.Provider>
    );

    renderHook(
      () =>
        useObserveCardContainer({
          messageId: '123',
          onResize,
          cardContainerRef: { current: 12313 } as any,
        }),
      {
        wrapper,
      },
    );
    eventCenter.emit(UIKitEvents.AFTER_CARD_RENDER, { messageId: '123' });
    vi.runAllTimers();
    expect(observeFn).toHaveBeenCalledOnce();

    expect(onResize).toHaveBeenCalledOnce();
    expect(disconnectFn).toHaveBeenCalledOnce();
    expect(initFn).toHaveBeenCalledOnce();
  });
});
