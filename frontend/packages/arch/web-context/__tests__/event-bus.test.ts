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

import { GlobalEventBus } from '../src/event-bus';

vi.mock('eventemitter3', () => ({
  default: class MockEventEmitter {
    eventsMap: Map<string, (() => void)[]> = new Map();
    emit(e: string) {
      const cbs = this.eventsMap.get(e) ?? [];
      cbs.forEach(cb => {
        cb();
      });
    }
    on(e: string, cb: () => void) {
      const cbs = this.eventsMap.get(e) ?? [];
      if (!cbs.find(cb)) {
        cbs.push(cb);
        this.eventsMap.set(e, cbs);
      }
    }
    off(e: string, cb: () => void) {
      const cbs = this.eventsMap.get(e) ?? [];
      const idx = cbs.findIndex(c => c === cb);
      if (idx !== -1) {
        cbs.splice(idx, 1);
        this.eventsMap.set(e, cbs);
      }
    }
  },
}));

describe('event-bus', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('A single key corresponds to a unique instance', () => {
    const testGlobalEventBus1 = GlobalEventBus.create('test');
    const testGlobalEventBus2 = GlobalEventBus.create('test');
    expect(testGlobalEventBus1).equal(testGlobalEventBus2);
  });

  test('Should not trigger events if not started or calling `clear`', () => {
    const testGlobalEventBus = GlobalEventBus.create('test2');
    testGlobalEventBus.stop();
    const testCb = vi.fn();
    testGlobalEventBus.on('test_event', testCb);
    testGlobalEventBus.emit('test_event');
    expect(testCb).not.toHaveBeenCalled();

    // Clear the buffer
    testGlobalEventBus.clear();
    testGlobalEventBus.start();
    expect(testCb).not.toHaveBeenCalled();
  });

  test('Should trigger events if started', () => {
    const testGlobalEventBus = GlobalEventBus.create('test3');
    const testCb1 = vi.fn();
    testGlobalEventBus.on('test_event', testCb1);
    testGlobalEventBus.emit('test_event');
    expect(testCb1).toHaveBeenCalled();
  });

  test('Should trigger events if started', () => {
    const testGlobalEventBus = GlobalEventBus.create('test4');
    const testCb1 = vi.fn();
    testGlobalEventBus.on('test_event', testCb1);
    testGlobalEventBus.off('test_event', testCb1);
    testGlobalEventBus.emit('test_event');
    expect(testCb1).not.toHaveBeenCalled();
  });
});
