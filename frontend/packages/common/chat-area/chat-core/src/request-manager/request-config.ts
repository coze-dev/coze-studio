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

import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { type DefaultRequestManagerOptions, RequestScene } from './types';
import { ApiError } from './api-error';

const useApiErrorResponseHook = (response: AxiosResponse) => {
  const { data = {} } = response;
  const { code, msg } = data;
  if (code !== 0) {
    const apiError = new ApiError(String(code), msg, response);

    return Promise.reject(apiError);
  }

  return response;
};

const useCsrfRequestHook = (config: InternalAxiosRequestConfig) => {
  config.headers.set('x-requested-with', 'XMLHttpRequest');
  if (
    config.method?.toLowerCase() === 'post' &&
    !config.headers.get('content-type')
  ) {
    // The new CSRF protection requires all post requests to have this header.
    config.headers.set('content-type', 'application/json');
    if (!config.data) {
      // Axios will automatically clear the content-type when the data is empty, so you need to set an empty object
      config.data = {};
    }
  }
  return config;
};

export const getDefaultSceneConfig = (): DefaultRequestManagerOptions => ({
  hooks: {
    onBeforeRequest: [useCsrfRequestHook],
    onAfterResponse: [useApiErrorResponseHook],
  },
  scenes: {
    [RequestScene.SendMessage]: {
      url: '/api/conversation/chat',
      method: 'POST',
    },
    [RequestScene.ResumeMessage]: {
      url: '/api/conversation/resume_chat',
      method: 'POST',
    },
    [RequestScene.GetMessage]: {
      url: '/api/conversation/get_message_list',
      method: 'POST',
    },
    [RequestScene.ClearHistory]: {
      url: '/api/conversation/clear_message',
      method: 'POST',
    },
    [RequestScene.ClearMessageContext]: {
      url: '/api/conversation/create_section',
      method: 'POST',
    },
    [RequestScene.DeleteMessage]: {
      url: '/api/conversation/delete_message',
      method: 'POST',
    },
    [RequestScene.BreakMessage]: {
      url: '/api/conversation/break_message',
      method: 'POST',
    },
    [RequestScene.ReportMessage]: {
      url: '/api/conversation/message/report',
      method: 'POST',
    },
    [RequestScene.ChatASR]: {
      url: '/api/audio/transcriptions',
      method: 'POST',
    },
  },
});
