/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
