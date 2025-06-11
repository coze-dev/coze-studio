import {
  search,
  IntelligenceStatus,
  type IntelligenceData,
  SearchScope,
  IntelligenceType,
  BotMode,
} from '@coze-arch/idl/intelligence_api';
import { intelligenceApi } from '@coze-arch/bot-api';

export interface IntelligenceList {
  list: IntelligenceData[];
  hasMore: boolean;
  nextCursorId?: string;
}

export const intelligenceSearchService = {
  async searchIntelligence(params: {
    spaceId: string;
    searchValue: string;
    cursorId?: string;
  }): Promise<IntelligenceList> {
    const resp = await intelligenceApi.GetDraftIntelligenceList({
      space_id: params.spaceId,
      name: params.searchValue,
      size: 20,
      cursor_id: params.cursorId,
      order_by: search.OrderBy.UpdateTime,
      types: [IntelligenceType.Bot],
      status: [IntelligenceStatus.Using],
      search_scope: SearchScope.CreateByMe,
      option: {
        need_replica: true,
      },
    });
    const intelligenceList = resp?.data?.intelligences ?? [];
    // 只保留single mode bot
    const singleModeBotList = intelligenceList.filter(
      intelligence => intelligence.other_info?.bot_mode === BotMode.SingleMode,
    );

    if (resp?.code === 0 && resp?.data) {
      return {
        list: singleModeBotList,
        hasMore: Boolean(resp.data.has_more),
        nextCursorId: resp.data.next_cursor_id,
      };
    }

    return {
      list: [],
      hasMore: false,
    };
  },
};
