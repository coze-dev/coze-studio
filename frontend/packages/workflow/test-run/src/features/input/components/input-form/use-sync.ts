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

import { useEffect } from 'react';

import { useMemoizedFn } from 'ahooks';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { useTestRunService } from '../../../../hooks';

export const useSync = (inputEvent: NodeEvent | undefined) => {
  const testRunService = useTestRunService();

  const eventSync = useMemoizedFn((event: NodeEvent | undefined) => {
    // end
    if (!event) {
      testRunService.continueTestRun();
      return;
    }
    testRunService.pauseTestRun();
  });

  useEffect(() => {
    eventSync(inputEvent);
  }, [inputEvent, eventSync]);
};
