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

import { describe, it, expect, vi } from 'vitest';
import { variableUtils } from '@coze-workflow/variable';
import { ViewVariableType, type DTODefine } from '@coze-workflow/base';

import { getInputTypeBase, getInputType } from '../get-input-type';

// Mock @coze-workflow/variable
vi.mock('@coze-workflow/variable', () => ({
  variableUtils: {
    dtoMetaToViewMeta: vi.fn(),
    // Mock other functions from variableUtils if needed by the tests or the module
  },
}));

// Mock @coze-workflow/base specifically for ViewVariableType.getLabel if it's complex
// Otherwise, direct usage is fine if it's simple enum/object lookup
vi.mock('@coze-workflow/base', async importOriginal => {
  const actual: object = await importOriginal();
  return {
    ...actual, // Preserve other exports from @coze-workflow/base
    ViewVariableType: {
      ...(actual as any).ViewVariableType,
      getLabel: vi.fn(type => `Label for ${type}`), // Simple mock for getLabel
    },
  };
});

describe('getInputTypeBase', () => {
  it('should return correct structure for a given ViewVariableType', () => {
    const inputType = ViewVariableType.String;
    const result = getInputTypeBase(inputType);

    expect(ViewVariableType.getLabel).toHaveBeenCalledWith(inputType);
    expect(result).toEqual({
      inputType: ViewVariableType.String,
      viewType: `Label for ${ViewVariableType.String}`,
      disabledTypes: undefined,
    });
  });

  it('should work with different ViewVariableTypes', () => {
    const inputType = ViewVariableType.Number;
    getInputTypeBase(inputType);
    expect(ViewVariableType.getLabel).toHaveBeenCalledWith(inputType);

    const inputTypeBool = ViewVariableType.Boolean;
    const resultBool = getInputTypeBase(inputTypeBool);
    expect(ViewVariableType.getLabel).toHaveBeenCalledWith(inputTypeBool);
    expect(resultBool.inputType).toBe(ViewVariableType.Boolean);
  });
});

describe('getInputType', () => {
  it('should call dtoMetaToViewMeta and return result from getInputTypeBase', () => {
    const mockInputDTO = {
      id: 'test-id',
      name: 'test-name',
    } as unknown as DTODefine.InputVariableDTO;
    const mockViewMetaType = ViewVariableType.Integer;

    (variableUtils.dtoMetaToViewMeta as any).mockReturnValue({
      type: mockViewMetaType,
    });

    const result = getInputType(mockInputDTO);

    expect(variableUtils.dtoMetaToViewMeta).toHaveBeenCalledWith(mockInputDTO);
    expect(ViewVariableType.getLabel).toHaveBeenCalledWith(mockViewMetaType);
    expect(result).toEqual({
      inputType: mockViewMetaType,
      viewType: `Label for ${mockViewMetaType}`,
      disabledTypes: undefined,
    });
  });
});
