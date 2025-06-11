import type React from 'react';

import {
  type BotAuditInfo,
  type BotInfoAuditData,
} from '@coze-arch/bot-api/playground_api';

export declare type UseBotInfoAuditorHook = () => {
  check: (params: BotAuditInfo) => Promise<BotInfoAuditData>;
  pass: boolean;
  setPass: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
};

export declare type BotInfoAuditFunc = (
  params: BotAuditInfo,
) => Promise<BotInfoAuditData>;
