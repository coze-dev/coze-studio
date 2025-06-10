import { useUserInfo } from '@coze-arch/foundation-sdk';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

import { publishAnchorService } from '@/service/connector-anchor';

export const useBizConnectorAnchor = () => {
  const userId = useUserInfo()?.user_id_str;
  const projectId = useParams<DynamicParams>().project_id;

  const setAnchor = (connectorId: string) => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.setAnchor({ projectId, userId, connectorId });
  };

  const getAnchor = () => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.getAnchor({ userId, projectId });
  };

  const removeAnchor = () => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.removeAnchor({ userId, projectId });
  };

  return {
    setAnchor,
    getAnchor,
    removeAnchor,
  };
};
