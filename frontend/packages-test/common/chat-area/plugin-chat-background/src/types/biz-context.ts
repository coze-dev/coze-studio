import { type Emitter } from 'mitt';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';

import { type BackgroundImageStore } from '../store';

export enum ChatBackgroundEventName {
  OnBackgroundChange = 'onBackgroundChange',
}
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ChatBackgroundEvent = {
  [ChatBackgroundEventName.OnBackgroundChange]: BackgroundImageInfo;
};

export interface BackgroundPluginBizContext {
  storeSet: {
    useChatBackgroundContext: BackgroundImageStore;
  };
  chatBackgroundEvent: Emitter<ChatBackgroundEvent>;
}
