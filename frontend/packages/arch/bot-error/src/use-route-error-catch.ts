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

import { useEffect } from 'react';

import { logger } from '@coze-arch/logger';

import { CustomError } from './custom-error';
import { ReportEventNames } from './const';
import { sendCertainError } from './certain-error';

const loggerWithScope = logger.createLoggerWith({
  ctx: {
    namespace: 'bot-global-error',
  },
});

export const useRouteErrorCatch = (error: unknown) => {
  useEffect(() => {
    if (error) {
      // Handling cases that are not instances of error
      const realError =
        error instanceof Error
          ? error
          : new CustomError(
              ReportEventNames.GlobalErrorBoundary,
              `global error route catch error infos:${String(error)}`,
            );
      // Filtering, other errors
      sendCertainError(realError, () => {
        loggerWithScope.persist.error({
          eventName: ReportEventNames.GlobalErrorBoundary,
          message: realError.message || 'global error route catch error',
          error: realError,
          meta: {
            name: realError.name,
            reportJsError: true,
          },
        });
      });
    }
  }, [error]);
};
