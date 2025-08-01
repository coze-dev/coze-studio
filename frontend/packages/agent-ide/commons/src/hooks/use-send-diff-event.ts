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
