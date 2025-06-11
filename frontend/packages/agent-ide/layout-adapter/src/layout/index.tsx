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
