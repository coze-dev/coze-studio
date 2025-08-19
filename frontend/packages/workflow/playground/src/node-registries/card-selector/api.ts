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

import { workflow } from '@coze-studio/api-schema';

import type { CardItem } from './types';

/**
 * 获取卡片列表
 * @param params 请求参数
 * @returns 卡片列表响应
 */
export async function fetchCardList(params: {
  sassWorkspaceId: string;
  pageNo?: number;
  pageSize?: number;
  searchValue?: string;
}): Promise<{ cardList: CardItem[]; totalNums: string; totalPages: string }> {
  const { sassWorkspaceId, pageNo = 1, pageSize = 200, searchValue } = params;

  try {
    const response = await workflow.GetCardList({
      sassWorkspaceId,
      pageNo,
      pageSize,
      searchValue,
    });

    if (response.code !== 0) {
      throw new Error(`API Error: ${response.msg}`);
    }

    // 转换为本地类型格式
    const cardList: CardItem[] = response.data.cardList.map(card => ({
      cardId: card.cardId,
      cardName: card.cardName,
      code: card.code,
      cardPicUrl: card.cardPicUrl,
      picUrl: card.picUrl,
      cardShelfStatus: card.cardShelfStatus,
      cardShelfTime: card.cardShelfTime,
      createUserId: card.createUserId,
      createUserName: card.createUserName,
      sassAppId: card.sassAppId,
      sassWorkspaceId: card.sassWorkspaceId,
      bizChannel: card.bizChannel,
      cardClassId: card.cardClassId,
    }));

    return {
      cardList,
      totalNums: response.data.totalNums,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error('Failed to fetch card list:', error);
    throw error;
  }
}
