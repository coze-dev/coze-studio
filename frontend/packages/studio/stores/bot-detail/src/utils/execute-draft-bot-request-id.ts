import { globalVars } from '@coze-arch/web-context';

export const getExecuteDraftBotRequestId = (): string =>
  globalVars.LAST_EXECUTE_ID;
