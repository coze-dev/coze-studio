import { useParams } from 'react-router-dom';
import React, { type FC, type PropsWithChildren } from 'react';

import { useCreation } from 'ahooks';
import { logger as rawLogger, LoggerContext } from '@coze-arch/logger';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';

const botDebugLogger = rawLogger.createLoggerWith({
  ctx: {
    meta: {},
    namespace: 'bot_debug',
  },
});

const BotEditorLoggerContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const params = useParams<DynamicParams>();

  const loggerWithId = useCreation(
    () =>
      botDebugLogger.createLoggerWith({
        ctx: {
          meta: {
            bot_id: params.bot_id,
          },
        },
      }),
    [],
  );

  return (
    <LoggerContext.Provider value={loggerWithId}>
      {children}
    </LoggerContext.Provider>
  );
};

export { BotEditorLoggerContextProvider };
