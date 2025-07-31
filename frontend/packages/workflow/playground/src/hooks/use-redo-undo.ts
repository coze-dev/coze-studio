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

import { useService } from '@flowgram-adapter/free-layout-editor';
import { HistoryService, WorkflowHistoryConfig } from '@coze-workflow/history';

export const useRedoUndo = () => {
  const historyService = useService<HistoryService>(HistoryService);
  const config = useService<WorkflowHistoryConfig>(WorkflowHistoryConfig);

  return {
    start: () => {
      historyService.start();
      config.disabled = false;
    },
    stop: () => {
      historyService.stop();
      config.disabled = true;
    },
  };
};
