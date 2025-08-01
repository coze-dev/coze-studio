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

import {
  ContextMode,
  type GetDraftBotInfoAgwData,
  ModelStyle,
} from '@coze-arch/idl/playground_api';
import { ContextContentType } from '@coze-arch/idl/developer_api';

import { getDefaultModelStore, useModelStore } from '../../src/store/model';
import { useBotDetailStoreSet } from '../../src/store/index';

describe('useModelStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });

  it('setModel correctly updates the model state', () => {
    const newModel = {
      config: { model: 'new model' },
      modelList: [],
    };
    useModelStore.getState().setModel(newModel);
    expect(useModelStore.getState()).toMatchObject(newModel);
  });

  it('setModelByImmer', () => {
    const model = {
      config: { model: 'fake model' },
      modelList: [],
    };

    useModelStore.getState().setModelByImmer(state => {
      state.config = model.config;
      state.modelList = model.modelList;
    });

    expect(useModelStore.getState()).toMatchObject(model);
  });
  it('transformDto2Vo handles valid bot data', () => {
    const botData = {
      bot_info: {
        model_info: { model_id: 'bot1', temperature: 0.5 },
      },
      bot_option_data: {
        model_detail_map: {
          bot1: { model_name: 'Bot One' },
        },
      },
    };

    const result = useModelStore.getState().transformDto2Vo(botData);

    expect(result).toMatchObject({
      model: 'bot1',
      temperature: 0.5,
      model_name: 'Bot One',
    });
  });

  it('initStore sets the state correctly with valid bot data', () => {
    const validBotData = {
      bot_info: {
        model_info: { model_id: 'bot1', temperature: 0.8 },
      },
      bot_option_data: {
        model_detail_map: {
          bot1: { model_name: 'Bot One' },
        },
      },
    };

    useModelStore.getState().initStore(validBotData);

    expect(useModelStore.getState().config.model).toBe('bot1');
    expect(useModelStore.getState().config.temperature).toBe(0.8);
  });

  it('handles missing model gracefully in Vo to DTO transformation', () => {
    const model = {
      temperature: 0.7,
    };
    const result = useModelStore.getState().transformVo2Dto(model);
    expect(result).toMatchObject({});
  });

  it('transforms valid model correctly from VO to DTO', () => {
    const model = {
      model: 'bot1',
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      ShortMemPolicy: {
        HistoryRound: 3,
        ContextContentType: ContextContentType.USER_RES,
      },
      response_format: 'json',
      model_style: 'default',
    };
    const result = useModelStore.getState().transformVo2Dto(model);
    expect(result).toMatchObject({
      model_id: 'bot1',
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      presence_penalty: 0.5,
      frequency_penalty: 0.5,
      short_memory_policy: {
        history_round: 3,
        context_mode: ContextContentType.USER_RES,
      },
      response_format: 'json',
      model_style: 'default',
    });
  });

  it('initializes store correctly with incomplete bot data', () => {
    const incompleteBotData = {
      bot_info: {},
      bot_option_data: {},
    };
    useModelStore.getState().initStore(incompleteBotData);
    expect(useModelStore.getState()).toMatchObject(getDefaultModelStore());
  });

  it('handles missing model gracefully in Vo to DTO transformation', () => {
    const model = {
      temperature: 0.7,
    };
    const result = useModelStore.getState().transformVo2Dto(model);
    expect(result).toMatchObject({});
  });

  it('clears store to default state successfully', () => {
    const modelData = {
      model: 'bot1',
      temperature: 0.5,
    };
    useModelStore.getState().setModel(modelData);
    useModelStore.getState().clear();
    expect(useModelStore.getState().config).toMatchObject(
      getDefaultModelStore().config,
    );
  });
});
describe('useModelStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('transforms valid bot data to VO correctly', () => {
    const botData: GetDraftBotInfoAgwData = {
      bot_info: {
        model_info: {
          model_id: 'bot1',
          temperature: 0.5,
          model_style: ModelStyle.Balance,
          short_memory_policy: {
            context_mode: ContextMode.Chat,
          },
        },
      },
      bot_option_data: {
        model_detail_map: {
          bot1: { model_name: 'Bot One' },
        },
      },
    };
    const result = useModelStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      model: 'bot1',
      temperature: 0.5,
      model_name: 'Bot One',
      model_style: ModelStyle.Balance,
      ShortMemPolicy: {
        ContextContentType: ContextContentType.USER_RES,
        HistoryRound: undefined,
      },
    });
  });

  it('returns default properties when both model_info and model_detail_map are missing', () => {
    const botData = {
      bot_info: {},
      bot_option_data: {},
    };
    const result = useModelStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      model: undefined,
      temperature: undefined,
      model_name: '',
      model_style: undefined,
      ShortMemPolicy: {
        ContextContentType: undefined,
        HistoryRound: undefined,
      },
    });
  });
});
