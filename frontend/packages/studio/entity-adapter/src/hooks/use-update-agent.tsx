import { type MutableRefObject } from 'react';

import { type DraftBot } from '@coze-arch/bot-api/developer_api';

import { useCreateOrUpdateAgent } from './use-create-or-update-agent';

export const useUpdateAgent = ({
  botInfoRef,
  onSuccess,
}: {
  botInfoRef?: MutableRefObject<DraftBot | undefined>;
  onSuccess?: (
    botId?: string,
    spaceId?: string,
    extra?: {
      botName?: string;
      botAvatar?: string;
    },
  ) => void;
}) =>
  useCreateOrUpdateAgent({
    botInfoRef,
    onSuccess,
    mode: 'update',
  });
