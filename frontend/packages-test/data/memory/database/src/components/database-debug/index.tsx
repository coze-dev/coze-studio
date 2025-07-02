import { useShallow } from 'zustand/react/shallow';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';

import MultiTable from './multi-table';

export const DatabaseDebug = () => {
  const botID = useBotInfoStore(state => state.botId);

  const { databaseList } = useBotSkillStore(
    useShallow(detail => ({
      databaseList: detail.databaseList,
    })),
  );

  return <MultiTable botID={botID} databaseList={databaseList} />;
};
