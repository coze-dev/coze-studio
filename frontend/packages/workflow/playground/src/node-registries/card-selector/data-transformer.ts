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

import { get } from 'lodash-es';
import { type NodeDataDTO, VariableTypeDTO } from '@coze-workflow/base';

import { type FormData } from './types';
import { OUTPUTS } from './constants';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (value: NodeDataDTO) => ({
  ...(value ?? {}),
  outputs: value?.outputs ?? OUTPUTS,
  inputs: {
    inputParameters: value?.inputs?.inputParameters ?? [],
    filterSelector: value?.inputs?.filterSelector ?? 'all',
    // 从BlockInput结构中提取简单字符串
    content:
      (get(value, 'inputs.content.value.content') as string | undefined) || '',
    streamingOutput: value?.inputs?.streamingOutput ?? false,
  },
});

/**
 * 前端表单数据 -> 节点后端数据
 * 处理筛选逻辑和卡片选择数据转换
 */
export const transformOnSubmit = (value: FormData): NodeDataDTO =>
  ({
    ...value,
    inputs: {
      ...value.inputs,
      // 将简单字符串转换为BlockInput结构
      content: {
        type: VariableTypeDTO.string,
        value: {
          type: 'literal',
          content: value.inputs.content || '',
        },
      },
    },
  }) as unknown as NodeDataDTO;

/**
 * 根据筛选类型处理卡片数据的辅助函数
 */
interface CardData {
  type: string;
  content: unknown;
}

export const processCardsByFilter = (
  cards: CardData[],
  filterType: string,
): CardData[] => {
  if (filterType === 'all') {
    return cards;
  }

  return cards.filter(card => {
    switch (filterType) {
      case 'text':
        return card.type === 'text';
      case 'image':
        return card.type === 'image';
      case 'video':
        return card.type === 'video';
      case 'link':
        return card.type === 'link';
      default:
        return true;
    }
  });
};
