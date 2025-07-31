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

import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { MemoryToolPane } from '@coze-agent-ide/memory-tool-pane-adapter';
import { DebugToolList } from '@coze-agent-ide/debug-tool-list';

export interface WorkflowModeToolPaneListProps {
  pageFrom: BotPageFromEnum | undefined;
  showBackground: boolean;
}

export const WorkflowModeToolPaneList: React.FC<
  WorkflowModeToolPaneListProps
> = ({ pageFrom, showBackground }) => {
  if (pageFrom === BotPageFromEnum.Store) {
    return (
      <DebugToolList showBackground={showBackground}>
        <MemoryToolPane />
      </DebugToolList>
    );
  }
  return (
    <DebugToolList showBackground={showBackground}>
      {/* Memory view data entry */}
      <MemoryToolPane />
    </DebugToolList>
  );
};
