import { useParams } from 'react-router-dom';

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
export const useSendDiffEvent = () => {
  const params = useParams();
  const spaceId = params.space_id || '';
  const botId = params.bot_id || '';
  const sendViewDiffEvent = () => {
    sendTeaEvent(EVENT_NAMES.bot_diff_viewdetail, {
      workspace_id: spaceId,
      bot_id: botId,
    });
  };
  const sendManualMergeEvent = (isSubmit: boolean) => {
    sendTeaEvent(EVENT_NAMES.bot_merge_manual, {
      workspace_id: spaceId,
      bot_id: botId,
      submit_or_not: isSubmit,
    });
  };
  return {
    sendViewDiffEvent,
    sendManualMergeEvent,
  };
};
