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
import {
  GenerationDiversity,
  type InputValueDTO,
  VariableTypeDTO,
} from '@coze-workflow/base';

import {
  formatModelData,
  getDefaultLLMParams,
  reviseLLMParamPair,
} from '../llm-utils';
import { mockLLMModels } from './__mocks__/mock-models';

const mockModels = mockLLMModels.data.model_list;

describe('llm-utils', () => {
  describe('formatModelData', () => {
    it('should convert string values to number based on modelMeta', () => {
      const model = {
        temperature: '0.8',
        maxTokens: '1024',
        modelType: '1737521813',
        otherParam: '保持字符串',
      };
      const modelMeta = mockModels[0];

      const result = formatModelData(model, modelMeta);

      expect(result.temperature).toBe(0.8);
      expect(result.maxTokens).toBe(1024);
      expect(result.modelType).toBe('1737521813');
      expect(result.otherParam).toBe('保持字符串');
    });

    it('should return original value when modelMeta is undefined', () => {
      const model = { temperature: '0.8' };
      const result = formatModelData(model, undefined);
      expect(result.temperature).toBe('0.8');
    });
  });

  describe('getDefaultLLMParams', () => {
    it('should select default model by DEFAULT_MODEL_TYPE', () => {
      const params = getDefaultLLMParams(mockModels);

      expect(params.modelType).toBe(mockModels[0].model_type);
      expect(params.modelName).toBe(mockModels[0].name);
      expect(params.generationDiversity).toBe(GenerationDiversity.Balance);
      expect(params.temperature).toBe(0.8); // Balance default from mockModels [0]
    });
  });

  describe('reviseLLMParamPair', () => {
    it('should fix typo "modleName" to "modelName"', () => {
      const input = {
        name: 'modleName',
        input: {
          type: VariableTypeDTO.string,
          value: { content: '豆包·1.5·Pro·32k' },
        },
      };
      const [key, value] = reviseLLMParamPair(input as InputValueDTO);
      expect(key).toBe('modelName');
      expect(value).toBe('豆包·1.5·Pro·32k');
    });

    it('should convert number types to number', () => {
      const floatInput = {
        name: 'temperature',
        input: { type: VariableTypeDTO.float, value: { content: '0.8' } },
      };
      const [_, floatValue] = reviseLLMParamPair(floatInput as InputValueDTO);
      expect(floatValue).toBe(0.8);

      const intInput = {
        name: 'maxTokens',
        input: { type: VariableTypeDTO.integer, value: { content: '1024' } },
      };
      const [__, intValue] = reviseLLMParamPair(intInput as InputValueDTO);
      expect(intValue).toBe(1024);
    });
  });
});
