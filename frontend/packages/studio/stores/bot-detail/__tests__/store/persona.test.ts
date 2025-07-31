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

import { PromptType } from '@coze-arch/idl/developer_api';

import {
  getDefaultPersonaStore,
  usePersonaStore,
} from '../../src/store/persona';
import { useBotDetailStoreSet } from '../../src/store/index';

describe('usePersonaStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('setPersona', () => {
    // no UT needed
  });

  it('setPersonaByImmer', () => {
    const persona = {
      systemMessage: {
        prompt_type: PromptType.SYSTEM,
        data: 'fake prompt',
        isOptimize: false,
      },
      optimizePrompt: 'fake optimize prompt',
      promptOptimizeUuid: 'fake optimize uuid ',
      promptOptimizeStatus: 'endResponse',
    } as const;

    usePersonaStore.getState().setPersonaByImmer(state => {
      state.systemMessage = persona.systemMessage;
      state.optimizePrompt = persona.optimizePrompt;
      state.promptOptimizeUuid = persona.promptOptimizeUuid;
      state.promptOptimizeStatus = persona.promptOptimizeStatus;
    });

    expect(usePersonaStore.getState()).toMatchObject(persona);
  });

  it('transforms DTO to VO correctly', () => {
    const botData = {
      bot_info: {
        prompt_info: {
          prompt: 'transformed prompt',
        },
      },
    } as const;

    const result = usePersonaStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      data: 'transformed prompt',
      prompt_type: PromptType.SYSTEM,
      isOptimize: false,
      record_id: '',
    });
  });

  it('initializes store with provided data', () => {
    const botData = {
      bot_info: {
        prompt_info: {
          prompt: 'initial prompt',
        },
      },
    } as const;

    usePersonaStore.getState().initStore(botData);
    expect(usePersonaStore.getState().systemMessage).toMatchObject({
      data: 'initial prompt',
      prompt_type: PromptType.SYSTEM,
      isOptimize: false,
      record_id: '',
    });
  });

  it('clears the store to default state', () => {
    const persona = {
      systemMessage: {
        prompt_type: PromptType.SYSTEM,
        data: 'some prompt',
        isOptimize: false,
        record_id: '123',
      },
      optimizePrompt: 'some optimize prompt',
      promptOptimizeUuid: 'some uuid',
      promptOptimizeStatus: 'responding',
    } as const;

    usePersonaStore.getState().setPersonaByImmer(state => {
      state.systemMessage = persona.systemMessage;
      state.optimizePrompt = persona.optimizePrompt;
      state.promptOptimizeUuid = persona.promptOptimizeUuid;
      state.promptOptimizeStatus = persona.promptOptimizeStatus;
    });

    usePersonaStore.getState().clear();
    expect(usePersonaStore.getState()).toMatchObject(getDefaultPersonaStore());
  });

  it('transforms persona with all properties correctly', () => {
    const persona = {
      data: 'test prompt',
      prompt_type: PromptType.SYSTEM,
      isOptimize: true,
      record_id: 'test_id',
    };
    const result = usePersonaStore.getState().transformVo2Dto(persona);
    expect(result).toMatchObject({
      prompt: 'test prompt',
    });
    const result1 = usePersonaStore.getState().transformVo2Dto({
      data: undefined,
    });
    expect(result1).toMatchObject({
      prompt: '',
    });
  });

  it('transforms valid bot data correctly', () => {
    const botData = {
      bot_info: {
        prompt_info: {
          prompt: 'valid prompt',
        },
      },
    };
    const result = usePersonaStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      data: 'valid prompt',
      prompt_type: PromptType.SYSTEM,
      isOptimize: false,
      record_id: '',
    });
  });

  it('returns empty data when prompt is missing', () => {
    const botData = {
      bot_info: {
        prompt_info: {},
      },
    };
    const result = usePersonaStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      data: '',
      prompt_type: PromptType.SYSTEM,
      isOptimize: false,
      record_id: '',
    });
  });

  it('handles missing bot_info gracefully', () => {
    const botData = {};
    const result = usePersonaStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      data: '',
      prompt_type: PromptType.SYSTEM,
      isOptimize: false,
      record_id: '',
    });
  });
});
