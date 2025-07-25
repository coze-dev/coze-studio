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

export { SkillKeyEnum };

/**
 * `模块折叠 有关事件` 和 `模块主键` 之间的映射关系
 * @deprecated 废弃，请使用@coze-agent-ide/tool中的openBlockEventToToolKey
 */
export const openBlockEventToBlockKey = {
  [OpenBlockEvent.PLUGIN_API_BLOCK_OPEN]: SkillKeyEnum.PLUGIN_API_BLOCK,
  [OpenBlockEvent.WORKFLOW_BLOCK_OPEN]: SkillKeyEnum.WORKFLOW_BLOCK,
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
  [OpenBlockEvent.BACKGROUND_IMAGE_BLOCK]: SkillKeyEnum.BACKGROUND_IMAGE_BLOCK,
};

export const TEMP_MAX_INTENT_LENGTH = 500;
