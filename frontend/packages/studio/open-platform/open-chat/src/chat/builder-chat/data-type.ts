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

import { type MixInitResponse } from '@coze-common/chat-area';

import { type EInputMode } from '@/types/props';

export interface ProjectInfoResp {
  data: {
    icon_url: string;
    name: string;
  };
}

export interface SuggestPromoteInfo {
  suggestReplyMode?: number;
  customizedSuggestPrompt?: string;
}
export interface BackgroundImageResp {
  theme_color?: string;
  gradient_position: {
    left?: number;
    right?: number;
  };
  canvas_position: {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
  };
  image_url?: string;
  origin_image_url?: string;
}
export interface WorkflowInfoResp {
  role?: {
    avatar?: {
      image_uri?: string;
      image_url?: string;
    };
    description?: string;
    name?: string;
    background_image_info?: {
      web_background_image?: BackgroundImageResp;
      mobile_background_image: BackgroundImageResp;
    };
    id: string;
    connector_id: string;
    suggest_reply_info?: {
      suggest_reply_mode?: number;
      customized_suggest_prompt?: string;
    };
    audio_config?: {
      is_text_to_voice_enable?: boolean;
      voice_config_map?: Record<
        string,
        {
          voice_id: string;
          name: string;
        }
      >;
    };
    workflow_id: string;
    onboarding_info: {
      prologue: string;
      display_all_suggestions: boolean;
      suggested_questions: string[];
    };
    user_input_config?: {
      default_input_mode: number;
    };
  };
}

export type InitData = Pick<
  MixInitResponse,
  'prologue' | 'onboardingSuggestions' | 'backgroundInfo'
> & {
  prologue: string;
  onboardingSuggestions: {
    id: string;
    content: string;
  }[];
  botInfo: {
    url: string;
    nickname: string;
    id: string;
  };
  displayAllSuggest?: boolean;
  suggestPromoteInfo?: SuggestPromoteInfo;
  defaultInputMode?: EInputMode;
  customBgInfo?: {
    imgUrl: string;
    themeColor: string; // 背景颜色
  };
};

export interface CozeApiFullFilledRes {
  status: string;
  reason: {
    code: number;
  };
  data: unknown;
}
