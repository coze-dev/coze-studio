import { useParams } from 'react-router-dom';

import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';

export const useSendTeaEventForMemoryDebug = (p: { isStore: boolean }) => {
  const { isStore = false } = p;
  // TODO@XML 看起来在商店也用到了，先不改
  const params = useParams<DynamicParams>();
  const { bot_id = '', product_id = '' } = params;

  const resourceTypeMaps = {
    longTimeMemory: 'long_term_memory',
    database: 'database',
    variable: 'variable',
    filebox: 'filebox',
  };

  return (type: string, extraParams: Record<string, unknown> = {}) => {
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      bot_id: isStore ? product_id : bot_id,
      product_id: isStore ? product_id : '',
      resource_type: resourceTypeMaps[type || ''],
      action: 'turn_on',
      source: isStore ? 'store_detail_page' : 'bot_detail_page',
      source_detail: 'memory_preview',
      ...extraParams,
    });
  };
};
