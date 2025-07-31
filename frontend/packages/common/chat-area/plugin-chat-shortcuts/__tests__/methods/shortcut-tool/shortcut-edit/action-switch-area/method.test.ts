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

import { InputType } from '@coze-arch/bot-api/playground_api';

import { type ShortcutEditFormValues } from '../../../../../src/shortcut-tool/types';
import {
  initComponentsByToolParams,
  getUnusedComponents,
} from '../../../../../src/shortcut-tool/shortcut-edit/action-switch-area/method';

describe('initComponentsByToolParams', () => {
  it('should initialize components correctly', () => {
    const params = [
      { name: 'param1', desc: 'description1', refer_component: true },
      { name: 'param2', desc: 'description2', refer_component: false },
    ];
    const expected = [
      {
        name: 'param1',
        parameter: 'param1',
        description: 'description1',
        input_type: InputType.TextInput,
        default_value: { value: '' },
        hide: false,
      },
      {
        name: 'param2',
        parameter: 'param2',
        description: 'description2',
        input_type: InputType.TextInput,
        default_value: { value: '' },
        hide: true,
      },
    ];
    expect(initComponentsByToolParams(params)).toEqual(expected);
  });

  it('should handle empty params', () => {
    expect(initComponentsByToolParams([])).toEqual([]);
  });
});

describe('getUnusedComponents', () => {
  it('should return unused components', () => {
    // @ts-expect-error -- hide is missing
    const shortcut: ShortcutEditFormValues = {
      components_list: [
        { name: 'comp1', hide: false },
        { name: 'comp2', hide: false },
      ],
      template_query: '{{comp1}}',
    };
    const expected = [{ name: 'comp2', hide: false }];
    expect(getUnusedComponents(shortcut)).toEqual(expected);
  });

  it('should handle empty components_list', () => {
    // @ts-expect-error -- hide is missing
    const shortcut: ShortcutEditFormValues = {
      components_list: [],
      template_query: '',
    };
    expect(getUnusedComponents(shortcut)).toEqual([]);
  });

  it('should handle no unused components', () => {
    // @ts-expect-error -- hide is missing
    const shortcut: ShortcutEditFormValues = {
      components_list: [{ name: 'comp1', hide: false }],
      template_query: '{{comp1}}',
    };
    expect(getUnusedComponents(shortcut)).toEqual([]);
  });
});
