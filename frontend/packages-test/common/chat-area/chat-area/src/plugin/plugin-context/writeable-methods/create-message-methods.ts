import { type Reporter } from '@coze-arch/logger';

import { type MethodCommonDeps } from '../../types';
import { type SystemLifeCycleService } from '../../life-cycle';
import { stopResponding } from '../../../utils/stop-responding';
import { createAndSendResumeMessage } from '../../../utils/resume-message';
import { getSendTextMessageImplement } from '../../../hooks/messages/use-send-message/text-message';
import { type StoreSet } from '../../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../../context/chat-area-context/chat-area-callback';

export const createWriteableMessageMethods = ({
  storeSet,
  eventCallback,
  reporter,
  lifeCycleService,
  deps,
}: {
  storeSet: StoreSet;
  eventCallback: ChatAreaEventCallback | undefined;
  reporter: Reporter;
  lifeCycleService: SystemLifeCycleService;
  deps: MethodCommonDeps;
}) => ({
  stopResponding: () =>
    stopResponding({ storeSet, eventCallback, reporter, lifeCycleService }),
  sendResumeMessage: createAndSendResumeMessage({ storeSet }),
  sendTextMessage: getSendTextMessageImplement(deps),
});
