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

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  EVENT_NAMES,
  ParamsTypeDefine,
} from '@coze-studio/tea-interface/events';
import type { IConfigParam } from '@coze-studio/tea-interface';

import proxy, { type Tea } from '../src/index';

describe('Tea Adapter', () => {
  let teaInstance: Tea;

  beforeEach(() => {
    // Initialize the Tea instance first
    (proxy as Tea).init({
      autoStart: true,
    });
    teaInstance = proxy as Tea;
  });

  it('should be a proxy object', () => {
    expect(proxy).toBeDefined();
    expect(typeof proxy).toBe('function');
  });

  it('should trigger apply', () => {
    const result = (proxy as any)('hello', 'world');

    expect(result).toBe(undefined);
  });

  it('should have all required Tea interface methods', () => {
    const methods = [
      'getInstance',
      'init',
      'config',
      'reStart',
      'getConfig',
      'event',
      'start',
      'stop',
      'sendEvent',
      'resetStayParams',
      'checkInstance',
    ];

    methods.forEach(method => {
      expect(typeof (proxy as Tea)[method as keyof Tea]).toBe('function');
    });
  });

  it('should have Collector property', () => {
    expect(teaInstance).toBeDefined();
  });

  it('should return undefined for getConfig', () => {
    expect(teaInstance).toBeDefined();
    expect(teaInstance.getConfig('any-key')).toBeUndefined();
  });

  it('should not throw when calling methods', () => {
    expect(teaInstance).toBeDefined();
    const methods = [
      'getInstance',
      'reStart',
      'start',
      'stop',
      'checkInstance',
    ] as const;

    methods.forEach(method => {
      expect(() => {
        teaInstance[method]();
      }).not.toThrow();
    });
  });

  it('should handle init with partial params', () => {
    expect(teaInstance).toBeDefined();
    const initParam = {
      autoStart: true,
    };
    expect(() => teaInstance.init(initParam)).not.toThrow();
  });

  it('should handle config with params', () => {
    expect(teaInstance).toBeDefined();
    const config: IConfigParam = {
      // Add the necessary configuration parameters
    };
    expect(() => teaInstance.config(config)).not.toThrow();
  });

  it('should handle event with string name', () => {
    expect(teaInstance).toBeDefined();
    expect(() => teaInstance.event('test-event')).not.toThrow();
  });

  it('should handle event with EVENT_NAMES and params', () => {
    expect(teaInstance).toBeDefined();
    const eventName = 'test-event' as EVENT_NAMES;
    const params = {} as ParamsTypeDefine[typeof eventName];
    expect(() => teaInstance.event(eventName, params)).not.toThrow();
  });

  it('should handle sendEvent with type parameters', () => {
    expect(teaInstance).toBeDefined();
    const eventName = 'test-event' as EVENT_NAMES;
    const params = {} as ParamsTypeDefine[typeof eventName];
    expect(() => teaInstance.sendEvent(eventName, params)).not.toThrow();
  });

  it('should handle resetStayParams with all parameters', () => {
    expect(teaInstance).toBeDefined();
    expect(() =>
      teaInstance.resetStayParams('/test', 'Test Title', 'https://test.com'),
    ).not.toThrow();
  });

  it('should be able to call sendEvent', () => {
    expect(teaInstance).toBeDefined();
    const eventName = 'test-event' as EVENT_NAMES;
    const params = {} as ParamsTypeDefine[typeof eventName];
    expect(() => teaInstance.sendEvent(eventName, params)).not.toThrow();
  });
});
