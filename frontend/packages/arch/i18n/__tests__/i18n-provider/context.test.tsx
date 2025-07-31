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

import { describe, it, expect } from 'vitest';

import { i18nContext } from '../../src/i18n-provider/context';

describe('i18n-provider/context', () => {
  it('should create a context with default values', () => {
    // Verify that i18nContext was created correctly
    expect(i18nContext).toBeDefined();

    // Get Default Values - Use Type Assertions to Access Internal Properties
    // @ts-expect-error - access internal properties
    const defaultValue = i18nContext._currentValue;

    // Verify that the i18n object in the default value exists
    expect(defaultValue.i18n).toBeDefined();

    // Verify that the t function exists
    expect(defaultValue.i18n.t).toBeDefined();
    expect(typeof defaultValue.i18n.t).toBe('function');

    // Verify the behavior of the t function
    expect(defaultValue.i18n.t('test-key')).toBe('test-key');

    // Verify that i18nContext is an object
    expect(typeof i18nContext).toBe('object');
  });
});
