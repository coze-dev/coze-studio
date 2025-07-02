import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

import { messageReportEvent } from '@coze-arch/bot-utils';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';

export const useMessageReportEvent = () => {
  const params = useParams<DynamicParams>();
  useEffect(() => {
    if (params.bot_id) {
      messageReportEvent.start(params.bot_id);
    }
    return () => {
      messageReportEvent.interrupt();
    };
  }, [params.bot_id]);
};
