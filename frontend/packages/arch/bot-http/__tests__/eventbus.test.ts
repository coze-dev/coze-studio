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
