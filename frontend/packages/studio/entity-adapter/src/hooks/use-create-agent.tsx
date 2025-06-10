import { useRef } from 'react';

import { type DraftBot } from '@coze-arch/bot-api/developer_api';

import {
  type CreateAgentEntityProps,
  useCreateOrUpdateAgent,
} from './use-create-or-update-agent';

export const useCreateAgent = ({
  spaceId,
  onSuccess,
  showSpace,
  onBefore,
  onError,
  bizCreateFrom,
}: Omit<CreateAgentEntityProps, 'mode' | 'botInfoRef'>) => {
  const botInfoRef = useRef<DraftBot>({ visibility: 0 });
  return useCreateOrUpdateAgent({
    spaceId,
    botInfoRef,
    onBefore,
    onSuccess,
    onError,
    mode: 'add',
    showSpace,
    bizCreateFrom,
  });
};
