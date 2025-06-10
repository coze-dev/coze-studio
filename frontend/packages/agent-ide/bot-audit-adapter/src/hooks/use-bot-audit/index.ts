import { useState } from 'react';

import {
  type BotAuditInfo,
  type BotInfoAuditData,
} from '@coze-arch/bot-api/playground_api';
import {
  type UseBotInfoAuditorHook,
  type BotInfoAuditFunc,
} from '@coze-studio/bot-audit-base';

const defaultPassState = true;

export const botInfoAudit: BotInfoAuditFunc = (
  _: BotAuditInfo,
): Promise<BotInfoAuditData> => Promise.resolve({});

export const useBotInfoAuditor: UseBotInfoAuditorHook = () => {
  const [pass, setPass] = useState(defaultPassState);

  return {
    check: (_: BotAuditInfo) => Promise.resolve({}),
    pass,
    setPass,
    reset: () => {
      setPass(defaultPassState);
    },
  };
};
