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

import { createContext, useContext } from 'react';

export enum BotCreatorScene {
  Bot = 'bot',
  DouyinBot = 'douyin-bot',
}

const BotCreatorContext = createContext<{ scene: BotCreatorScene | undefined }>(
  {
    scene: BotCreatorScene.Bot,
  },
);

export const BotCreatorProvider = BotCreatorContext.Provider;

export const useBotCreatorContext = () => {
  const context = useContext(BotCreatorContext);

  if (!context) {
    throw new Error(
      'useBotCreatorContext must be used within a BotCreatorProvider',
    );
  }

  return context;
};
