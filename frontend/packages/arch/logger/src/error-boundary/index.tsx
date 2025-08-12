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
  ErrorBoundary as ReactErrorBoundary,
  useErrorBoundary,
  type ErrorBoundaryProps as ReactErrorBoundaryProps,
  type ErrorBoundaryPropsWithRender,
  type FallbackProps,
} from 'react-error-boundary';
import { type ErrorInfo, type ComponentType } from 'react';
import React, { useCallback, version } from 'react';

import { ApiError } from '../slardar/utils';
import { useLogger, type Logger } from '../logger';

// Copy from react-error-boundary@3.1.4 version source code
function useErrorHandler(givenError?: unknown): (error: unknown) => void {
  const [error, setError] = React.useState<unknown>(null);
  if (givenError !== null && givenError !== undefined) {
    throw givenError;
  }
  if (error !== null && error !== undefined) {
    throw error;
  }
  return setError;
}

export type FallbackRender = ErrorBoundaryPropsWithRender['fallbackRender'];

export { useErrorBoundary, useErrorHandler, type FallbackProps };

export type ErrorBoundaryProps = ReactErrorBoundaryProps & {
  /**
   * @Description The callback function is triggered by component DidCatch, and the parameters are passed through from the two parameters of component DidCatch
   * @param error specific error
   * @param info
   * @returns
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * @Description can reset some state of the component in this callback function to prevent some errors from happening again
   * @param details reset
   * @returns
   */
  onReset?: (
    details:
      | { reason: 'imperative-api'; args: [] }
      | { reason: 'keys'; prev: [] | undefined; next: [] | undefined },
  ) => void;
  resetKeys?: [];
  /**
   * Logger instance. Read from LoggerContext by default
   */
  // logger?: Logger;
  logger?: Logger;
  /**
   * The bottom cover component of the error display occurred.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FallbackComponent: ComponentType<FallbackProps>;
  /**
   * errorBoundaryName to report when an error occurs
   * Event: react_error_collection/react_error_by_api_collection
   */
  errorBoundaryName: string;
};

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  onError: propsOnError,
  errorBoundaryName = 'unknown',
  children,
  logger: loggerInProps,
  ...restProps
}) => {
  const loggerInContext = useLogger({ allowNull: true });
  const logger = loggerInProps || loggerInContext;

  if (!logger) {
    console.warn(
      `ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: ${errorBoundaryName}`,
    );
  }

  const onError = useCallback((error: Error, info: ErrorInfo) => {
    const { componentStack } = info;

    const meta = {
      reportJsError: true, // Marked as JS Error, report slardar.captureException
      errorBoundaryName,
      reactInfo: {
        componentStack,
        version,
      },
    };

    if (error instanceof ApiError) {
      logger?.persist.error({
        eventName: 'react_error_by_api_collection',
        error,
        meta,
      });
    } else {
      logger?.persist.error({
        eventName: 'react_error_collection',
        error,
        meta,
      });
    }
    propsOnError?.(error, info);
  }, []);

  return (
    <ReactErrorBoundary {...restProps} onError={onError}>
      {children}
    </ReactErrorBoundary>
  );
};
