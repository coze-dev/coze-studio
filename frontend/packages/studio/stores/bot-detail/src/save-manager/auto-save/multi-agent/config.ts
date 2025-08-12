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

import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { ItemTypeExtra } from '../../types';
import type { Agent } from '../../../types/agent';
import { type MultiAgentStore } from '../../../store/multi-agent/store';

type RegisterSystemContent = HostedObserverConfig<
  MultiAgentStore,
  ItemTypeExtra,
  Agent
>;

export const registerMultiAgentConfig: RegisterSystemContent = {
  key: ItemTypeExtra.MultiAgent,
  selector: state => state.agents?.[0],
  debounce: {
    default: DebounceTime.Immediate,
    description: DebounceTime.Long,
    'position.x': DebounceTime.Medium,
    'position.y': DebounceTime.Medium,
    'skills.knowledge.dataSetInfo.min_score': DebounceTime.Medium,
    'skills.knowledge.dataSetInfo.top_k': DebounceTime.Medium,
    'skills.knowledge.dataSetInfo.no_recall_reply_customize_prompt':
      DebounceTime.Long,
    'model.temperature': DebounceTime.Medium,
    'model.max_tokens': DebounceTime.Medium,
    'model.top_p': DebounceTime.Medium,
    'model.ShortMemPolicy.HistoryRound': DebounceTime.Medium,
    prompt: DebounceTime.Long, // Agent prompt word
    'suggestion.customized_suggest_prompt': DebounceTime.Long,
    intents: { arrayType: true, action: { E: DebounceTime.Long } },
  },
};
