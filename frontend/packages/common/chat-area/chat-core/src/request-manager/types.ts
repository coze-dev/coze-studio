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
  //为何这样，是由于OpenSdk 与 CozeSdk消息差异过大，缺少了Ack消息，需要构造出来。
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
