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

import { Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { useBotRouteConfig } from '@coze-agent-ide/space-bot/hook';
import { BotEditorLoggerContextProvider } from '@coze-agent-ide/space-bot/component';
import {
  BotCreatorProvider,
  BotCreatorScene,
} from '@coze-agent-ide/bot-creator-context';

const Layout = lazy(() =>
  import('./base').then(res => ({
    default: res.BotEditorInitLayoutAdapter,
  })),
);

export const BotEditorLayout = () => {
  const { requireBotEditorInit, pageName, hasHeader } = useBotRouteConfig();

  return (
    <BotCreatorProvider value={{ scene: BotCreatorScene.Bot }}>
      <BotEditorLoggerContextProvider>
        {requireBotEditorInit ? (
          <Suspense>
            <Layout pageName={pageName} hasHeader={hasHeader}>
              <Suspense>
                <Outlet />
              </Suspense>
            </Layout>
          </Suspense>
        ) : (
          <Suspense>
            <Outlet />
          </Suspense>
        )}
      </BotEditorLoggerContextProvider>
    </BotCreatorProvider>
  );
};
