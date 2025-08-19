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
import { isMobileOnly } from 'react-device-detect';

import { createRoot } from 'react-dom/client';
import { nanoid } from 'nanoid';
import { Language, Layout, AuthType } from '@coze-studio/open-chat/types';

import { type CozeChatOptions } from '@/types/client';
import { createGlobalStore, type ClientStore } from '@/store/global';
import CozeClientWidget from '@/components/widget';
import '@coze-common/assets/style/index.less';
import './main.less';

import { AuthClient } from './auth';
const formatOptions = (optionsRaw: CozeChatOptions) => {
  const options: CozeChatOptions = optionsRaw;
  const layoutDefault = isMobileOnly ? Layout.MOBILE : Layout.PC;
  options.config = options.config || {};
  options.config.botId =
    options.config.botInfo?.botId ||
    options.config.botId ||
    options.config.bot_id ||
    '';
  options.ui = optionsRaw.ui || {};

  // 小助手 ui基础配置
  options.ui.base = Object.assign(
    {
      layout: optionsRaw.componentProps?.layout || layoutDefault,
      lang: optionsRaw.componentProps?.lang || Language.EN,
      zIndex: optionsRaw.componentProps?.zIndex,
      icon: optionsRaw.componentProps?.icon,
    },
    optionsRaw.ui?.base || {},
  );

  // chatBot 配置格式化
  options.ui.chatBot = Object.assign(
    {
      title: optionsRaw.componentProps?.title,
      width: optionsRaw.componentProps?.width,
      uploadable: optionsRaw.componentProps?.uploadable ?? true,
    },
    optionsRaw.ui?.chatBot || {},
  );

  options.ui.asstBtn = Object.assign(
    {
      isNeed: true,
    },
    options.ui.asstBtn || {},
  );
  options.ui.header = Object.assign(
    {
      isShow: true,
      isNeedClose: true,
    },
    options.ui.header || {},
  );

  return options;
};
export class WebChatClient {
  static clients: WebChatClient[] = [];
  private root: ReturnType<typeof createRoot> | undefined;
  private readonly defaultRoot?: HTMLDivElement;
  private readonly globalStore: ClientStore;
  readonly authClient: AuthClient;
  readonly chatClientId = nanoid();
  readonly options: CozeChatOptions;
  readonly senderName: string;

  public constructor(options: CozeChatOptions) {
    console.info('WebChatClient constructorxxx', options);
    this.senderName = `chat-app-sdk-${Date.now()}`;
    this.options = formatOptions(options);
    this.authClient = new AuthClient(options);

    const { el } = this.options;

    this.globalStore = createGlobalStore(this);
    if (!this.authClient.checkOptions()) {
      return;
    }
    let renderEl: HTMLElement;
    if (!el) {
      this.defaultRoot = document.createElement('div');
      document.body.appendChild(this.defaultRoot);
      renderEl = this.defaultRoot;
    } else {
      renderEl = el;
    }

    this.root = createRoot(renderEl);
    this.root.render(
      <CozeClientWidget
        client={this}
        globalStore={this.globalStore}
        position={el ? 'static' : undefined}
      />,
    );

    WebChatClient.clients.push(this);
  }

  public showChatBot() {
    this.globalStore.getState().setChatVisible(true);
  }
  public hideChatBot() {
    this.globalStore.getState().setChatVisible(false);
  }
  public async getToken() {
    if (this.options.auth?.type === AuthType.TOKEN) {
      return await this.options.auth?.onRefreshToken?.('');
    }
  }

  public destroy() {
    this.root?.unmount();
    if (this.defaultRoot) {
      this.defaultRoot.remove();
    }

    WebChatClient.clients = WebChatClient.clients.filter(c => c !== this);
  }
}
