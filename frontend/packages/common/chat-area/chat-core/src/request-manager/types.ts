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
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestConfig,
} from 'axios';
import { type FetchSteamConfig } from '@coze-arch/fetch-stream';

import { type ParsedEvent } from '@/channel/http-chunk/types';

import { type PartiallyRequired } from '../shared/utils/data-handler';

export type RequestManagerOptions = {
  scenes?: {
    [key in RequestScene]?: SceneConfig;
  };
  hooks?: Hooks;
} & AxiosRequestConfig;

export type DefaultRequestManagerOptions = {
  scenes: {
    [key in RequestScene]: PartiallyRequired<SceneConfig, 'url'>;
  };
  hooks: Hooks;
} & AxiosRequestConfig;

interface InternalChannelSendMessageConfig {
  url: string;
  method: string;
  headers: [string, string][];
  body: string;
}

interface Hooks {
  onBeforeRequest?: Array<
    (
      requestConfig: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  >;
  onAfterResponse?: Array<
    (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  >;
  onBeforeSendMessage?: Array<
    (
      sendMessageConfig: InternalChannelSendMessageConfig,
    ) =>
      | InternalChannelSendMessageConfig
      | Promise<InternalChannelSendMessageConfig>
  >;
  //The reason for this is that OpenSdk and CozeSdk messages are too different, missing Ack messages and need to be constructed.
  onGetMessageStreamParser?: (
    requestMessageRawBody: Record<string, unknown>,
  ) => FetchSteamConfig<ParsedEvent>['streamParser'];
  onErrrorResponse?: Array<(response: AxiosResponse) => Promise<AxiosResponse>>;
}

export enum RequestScene {
  SendMessage = 'sendMessage',
  ResumeMessage = 'resumeMessage',
  GetMessage = 'getMessage',
  ClearHistory = 'clearHistory',
  ClearMessageContext = 'clearMessageContext',
  DeleteMessage = 'deleteMessage',
  BreakMessage = 'breakMessage',
  ReportMessage = 'reportMessage',
  ChatASR = 'chatASR',
}

export type SceneConfig = {
  hooks?: Hooks;
} & AxiosRequestConfig;
