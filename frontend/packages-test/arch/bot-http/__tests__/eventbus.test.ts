import {
  APIErrorEvent,
  clearAPIErrorEvent,
  emitAPIErrorEvent,
  handleAPIErrorEvent,
  removeAPIErrorEvent,
  startAPIErrorEvent,
  stopAPIErrorEvent,
} from '../src/eventbus';

const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockClear = vi.fn();

vi.mock('@coze-arch/web-context', () => ({
  GlobalEventBus: class MockGlobalEventBus {
    static create() {
      return new MockGlobalEventBus();
    }
    emit() {
      mockEmit();
    }
    on() {
      mockOn();
    }
    off() {
      mockOff();
    }
    start() {
      mockStart();
    }
    stop() {
      mockStop();
    }
    clear() {
      mockClear();
    }
  },
}));

describe('eventbus', () => {
  test('emitAPIErrorEvent', () => {
    emitAPIErrorEvent(APIErrorEvent.COUNTRY_RESTRICTED);
    expect(mockEmit).toHaveBeenCalled();
  });

  test('handleAPIErrorEvent', () => {
    handleAPIErrorEvent(APIErrorEvent.COUNTRY_RESTRICTED, vi.fn());
    expect(mockOn).toHaveBeenCalled();
  });

  test('removeAPIErrorEvent', () => {
    removeAPIErrorEvent(APIErrorEvent.COUNTRY_RESTRICTED, vi.fn());
    expect(mockOff).toHaveBeenCalled();
  });

  test('stopAPIErrorEvent', () => {
    stopAPIErrorEvent();
    expect(mockStop).toHaveBeenCalled();
  });

  test('startAPIErrorEvent', () => {
    startAPIErrorEvent();
    expect(mockStart).toHaveBeenCalled();
  });

  test('clearAPIErrorEvent', () => {
    clearAPIErrorEvent();
    expect(mockClear).toHaveBeenCalled();
  });
});
