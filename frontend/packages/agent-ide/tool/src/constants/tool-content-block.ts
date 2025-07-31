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

import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import { OpenBlockEvent } from '@coze-arch/bot-utils';
type IOpenBlockEventToToolKey = Record<string, SkillKeyEnum>;

// Module folding, the mapping between related events and module primary keys
export const openBlockEventToToolKey: IOpenBlockEventToToolKey = {
  [OpenBlockEvent.PLUGIN_API_BLOCK_OPEN]: SkillKeyEnum.PLUGIN_API_BLOCK,
  [OpenBlockEvent.WORKFLOW_BLOCK_OPEN]: SkillKeyEnum.WORKFLOW_BLOCK,
  [OpenBlockEvent.IMAGEFLOW_BLOCK_OPEN]: SkillKeyEnum.IMAGE_BLOCK,
  [OpenBlockEvent.DATA_SET_BLOCK_OPEN]: SkillKeyEnum.DATA_SET_BLOCK,
  [OpenBlockEvent.DATA_MEMORY_BLOCK_OPEN]: SkillKeyEnum.DATA_MEMORY_BLOCK,
  [OpenBlockEvent.TABLE_MEMORY_BLOCK_OPEN]: SkillKeyEnum.TABLE_MEMORY_BLOCK,
  [OpenBlockEvent.TIME_CAPSULE_BLOCK_OPEN]: SkillKeyEnum.TIME_CAPSULE_BLOCK,
  [OpenBlockEvent.ONBORDING_MESSAGE_BLOCK_OPEN]:
    SkillKeyEnum.ONBORDING_MESSAGE_BLOCK,
  [OpenBlockEvent.TASK_MANAGE_OPEN]: SkillKeyEnum.TASK_MANAGE_BLOCK,
  [OpenBlockEvent.SUGGESTION_BLOCK_OPEN]: SkillKeyEnum.AUTO_SUGGESTION,
  [OpenBlockEvent.TTS_BLOCK_OPEN]: SkillKeyEnum.TEXT_TO_SPEECH,
  [OpenBlockEvent.FILEBOX_OPEN]: SkillKeyEnum.FILEBOX_BLOCK,
};
