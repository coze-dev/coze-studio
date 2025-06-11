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
