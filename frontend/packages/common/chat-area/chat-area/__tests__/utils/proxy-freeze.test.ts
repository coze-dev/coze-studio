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

import { proxyFreeze } from '../../src/utils/proxy-freeze';

vi.stubGlobal('IS_DEV_MODE', true);

describe('proxyFreeze', () => {
  it('should return the same object for non-objects', () => {
    const nonObject = 42;
    // @ts-expect-error -- test use
    expect(proxyFreeze(nonObject)).toBe(nonObject);
  });

  it('should return a proxy for an object', () => {
    const obj = { a: 1 };
    const proxyObj = proxyFreeze(obj);
    expect(proxyObj).not.toBe(obj);
    expect(typeof proxyObj).toBe('object');
  });

  it('should prevent modifications to the proxied object', () => {
    const obj = { a: 1 };
    const proxyObj = proxyFreeze(obj) as { a: number };
    expect(() => {
      proxyObj.a = 2;
    }).toThrow();
  });

  it('should allow reading properties from the proxied object', () => {
    const obj = { a: 1 };
    const proxyObj = proxyFreeze(obj) as { a: number };
    expect(proxyObj.a).toBe(1);
  });

  it('should cache and return the same proxy for the same object', () => {
    const obj = { a: 1 };
    const proxyObj1 = proxyFreeze(obj);
    const proxyObj2 = proxyFreeze(obj);
    expect(proxyObj1).toBe(proxyObj2);
  });

  it('should not re-freeze already frozen objects', () => {
    const obj = { a: 1 };
    const proxyObj = proxyFreeze(obj);
    const proxyObj2 = proxyFreeze(proxyObj);
    expect(proxyObj).toBe(proxyObj2);
  });

  it('should recursively freeze nested objects', () => {
    const obj = { a: { b: 1 } };
    const proxyObj = proxyFreeze(obj) as { a: { b: number } };
    expect(() => {
      proxyObj.a.b = 2;
    }).toThrow();
  });
});
