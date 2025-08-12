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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import {
  type BotInfoForUpdate,
  type ContextMode,
  type GetDraftBotInfoAgwData,
} from '@coze-arch/idl/playground_api';
import {
  ContextContentType,
  type Model,
  type ModelInfo,
  type ModelInfo as ModelInfoConfig,
} from '@coze-arch/bot-api/developer_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';
import type { BotDetailModel } from '../types/model';
export const DEFAULT_MODEL_INFO = (): ModelInfo => ({
  model: '',
  temperature: 0,
  max_tokens: 4096,
  top_p: 0,
  frequency_penalty: 0,
  presence_penalty: 0,
  prompt_id: 0,
  ShortMemPolicy: {
    ContextContentType: ContextContentType.USER_RES,
  },
  card_ids: [],
});
export const getDefaultModelStore = (): ModelStore => ({
  config: {
    model: '',
    temperature: 0,
    max_tokens: 4096,
    top_p: 0,
    frequency_penalty: 0,
    presence_penalty: 0,
    prompt_id: 0,
    ShortMemPolicy: {
      ContextContentType: ContextContentType.USER_RES,
    },
    card_ids: [],
  },
  modelList: [],
});

/** Persona & Prompted Areas */
export interface ModelStore {
  config: ModelInfoConfig;
  /** All optional models */
  modelList: Model[];
}

export interface ModelAction {
  setModel: SetterAction<ModelStore>;
  setModelByImmer: (update: (state: ModelStore) => void) => void;
  transformDto2Vo: (
    botData: GetDraftBotInfoAgwData,
  ) => BotDetailModel['config'];
  transformVo2Dto: (
    model: BotDetailModel['config'],
  ) => BotInfoForUpdate['model_info'];
  initStore: (botData: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useModelStore = create<ModelStore & ModelAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultModelStore(),
      setModel: setterActionFactory<ModelStore>(set),
      setModelByImmer: update =>
        set(
          produce<ModelStore>(model => update(model)),
          false,
          'setModelByImmer',
        ),
      transformDto2Vo: botData => {
        const modelInfo = botData.bot_info.model_info;
        const config = botData.bot_option_data?.model_detail_map;
        return {
          model: modelInfo?.model_id,
          temperature: modelInfo?.temperature,
          max_tokens: modelInfo?.max_tokens,
          top_p: modelInfo?.top_p,
          frequency_penalty: modelInfo?.frequency_penalty,
          presence_penalty: modelInfo?.presence_penalty,
          ShortMemPolicy: {
            ContextContentType: modelInfo?.short_memory_policy
              ?.context_mode as unknown as ContextContentType,
            HistoryRound: modelInfo?.short_memory_policy?.history_round,
          },
          model_name:
            modelInfo?.model_id && config
              ? config[modelInfo.model_id]?.model_name
              : '',

          model_style: modelInfo?.model_style,
          response_format: modelInfo?.response_format,
        };
      },
      transformVo2Dto: model =>
        model?.model
          ? {
              model_id: model.model,
              temperature: model.temperature,
              max_tokens: model.max_tokens,
              top_p: model.top_p,
              presence_penalty: model.presence_penalty,
              frequency_penalty: model.frequency_penalty,
              short_memory_policy: {
                history_round: model?.ShortMemPolicy?.HistoryRound,
                context_mode: model?.ShortMemPolicy
                  ?.ContextContentType as unknown as ContextMode,
              },
              response_format: model.response_format,
              model_style: model.model_style,
            }
          : {},
      initStore: botData => {
        const { transformDto2Vo } = get();
        const { bot_info, bot_option_data } = botData;
        bot_info?.model_info && bot_option_data?.model_detail_map
          ? set({
              config: transformDto2Vo(botData),
            })
          : set({ config: DEFAULT_MODEL_INFO() });
      },
      clear: () => {
        set({ ...getDefaultModelStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.model',
    },
  ),
);
