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
