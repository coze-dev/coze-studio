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

import { describe, it, expect, vi, type Mock } from 'vitest';
import { DebounceTime } from '@coze-studio/autosave';

import { useModelStore } from '../../../../src/store/model';
import { ItemType } from '../../../../src/save-manager/types';
import { modelConfig } from '../../../../src/save-manager/auto-save/model/config';

// Mock the useModelStore
vi.mock('@/store/model', () => ({
  useModelStore: {
    getState: vi.fn(),
  },
}));

describe('modelConfig', () => {
  it('should have correct static configuration properties', () => {
    expect(modelConfig.key).toBe(ItemType.OTHERINFO);
    expect(typeof modelConfig.selector).toBe('function');
    // Example selector call
    const mockStore = { config: { model: 'test-model' } };
    // @ts-expect-error -- Mocking the store
    expect(modelConfig.selector(mockStore as any)).toEqual({
      model: 'test-model',
    });

    expect(modelConfig.debounce).toEqual({
      default: DebounceTime.Immediate,
      temperature: DebounceTime.Medium,
      max_tokens: DebounceTime.Medium,
      'ShortMemPolicy.HistoryRound': DebounceTime.Medium,
    });
    expect(modelConfig.middleware).toBeDefined();
    expect(typeof modelConfig.middleware?.onBeforeSave).toBe('function');
  });

  it('middleware.onBeforeSave should call transformVo2Dto and return correct structure', () => {
    const mockDataSource = { model: 'gpt-4', temperature: 0.7 };
    const mockTransformedDto = { model_id: 'gpt-4', temperature: 0.7 };
    const mockTransformVo2Dto = vi.fn().mockReturnValue(mockTransformedDto);

    (useModelStore.getState as Mock).mockReturnValue({
      transformVo2Dto: mockTransformVo2Dto,
    });

    const result = modelConfig.middleware?.onBeforeSave?.(
      mockDataSource as any,
    );

    expect(useModelStore.getState).toHaveBeenCalled();
    expect(mockTransformVo2Dto).toHaveBeenCalledWith(mockDataSource);
    expect(result).toEqual({
      model_info: mockTransformedDto,
    });
  });

  it('selector should return the config part of the store', () => {
    const mockState = {
      config: { model: 'test-model', temperature: 0.5 },
      anotherProperty: 'test',
    };
    // @ts-expect-error -- Mocking the store
    expect(modelConfig.selector(mockState as any)).toEqual(mockState.config);
  });
});
