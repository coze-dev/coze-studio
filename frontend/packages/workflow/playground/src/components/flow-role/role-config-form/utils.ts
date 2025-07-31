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

/* eslint-disable complexity */
import { isObject, isBoolean } from 'lodash-es';
import {
  SuggestReplyInfoMode,
  InputMode,
  type ChatFlowRole,
} from '@coze-arch/bot-api/workflow_api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formValue2Data = (values: any) => {
  const temp = values || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {
    // role name
    name: temp.name,
    // Role Description
    description: temp.description,
    onboarding_info: {
      display_all_suggestions: values.display_all_suggestions ?? false,
    },
    suggest_reply_info: {
      suggest_reply_mode: SuggestReplyInfoMode.Disable,
    },
    audio_config: {},
    user_input_config: {
      default_input_mode: InputMode.text,
    },
  };

  // avatar
  if (Array.isArray(temp.avatar) && temp.avatar.length) {
    const nextAvatar = temp.avatar[0];
    data.avatar = {
      image_uri: nextAvatar.uid,
      image_url: nextAvatar.url,
    };
  }

  // Introductory copy
  if (temp.prologue) {
    data.onboarding_info.prologue = temp.prologue.replace(/[\r\n]+$/g, '');
  }

  // Opening question
  if (temp.questions) {
    data.onboarding_info.suggested_questions = temp.questions;
  }

  // user suggestion
  if (temp.suggest && isObject(temp.suggest)) {
    data.suggest_reply_info = temp.suggest;
  }

  if (temp.background && isObject(temp.background)) {
    data.background_image_info = temp.background;
  }

  // timbre
  if (temp.voices && isObject(temp.voices)) {
    if (temp.voices.config && isObject(temp.voices.config)) {
      data.audio_config.voice_config_map = temp.voices.config;
    }
    if (!IS_OVERSEA) {
      data.audio_config.is_text_to_voice_enable =
        temp.voices.textToVoice ?? false;
    }
  }

  if (temp.default) {
    data.user_input_config.default_input_mode = temp.default;
  }

  return data;
};

export const data2FormValue = (data: ChatFlowRole = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any = {
    name: data.name,
    description: data.description,
    voices: {},
    background: {},
    suggest_reply_info: {
      // The default is open.
      suggest_reply_mode: SuggestReplyInfoMode.System,
    },
    display_all_suggestions:
      data.onboarding_info?.display_all_suggestions ?? false,
  };

  if (data.avatar?.image_url) {
    value.avatar = [
      {
        uid: data.avatar.image_uri,
        url: data.avatar.image_url,
      },
    ];
  }
  if (data.onboarding_info) {
    if (data.onboarding_info.prologue) {
      value.prologue = data.onboarding_info.prologue;
    }
    if (data.onboarding_info.suggested_questions) {
      value.questions = data.onboarding_info.suggested_questions;
    }
  }
  if (data.suggest_reply_info) {
    value.suggest = data.suggest_reply_info;
  }

  const background = data.background_image_info;
  if (background && isObject(background)) {
    Object.keys(background).forEach(key => {
      const val = background[key];
      value.background[key] = {
        ...val,
        origin_image_url: val?.image_url || val?.origin_image_url,
      };
    });
  }

  if (data.audio_config) {
    const voice = data.audio_config;
    if (voice.voice_config_map) {
      value.voices.config = voice.voice_config_map;
    }
    if (isBoolean(voice.is_text_to_voice_enable) && !IS_OVERSEA) {
      value.voices.textToVoice = voice.is_text_to_voice_enable;
    }
  }
  if (data.user_input_config) {
    if (data.user_input_config.default_input_mode) {
      value.default = data.user_input_config.default_input_mode;
    }
  }

  return value;
};
