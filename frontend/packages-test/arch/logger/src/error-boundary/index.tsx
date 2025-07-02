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

// 拷贝自 react-error-boundary@3.1.4版本源码
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
   * @description componentDidCatch 触发该回调函数，参数透传自 componentDidCatch 的两个参数
   * @param error 具体错误
   * @param info
   * @returns
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * @description 可在该回调函数中重置组件的一些 state，以避免一些错误的再次发生
   * @param details reset 后
   * @returns
   */
  onReset?: (
    details:
      | { reason: 'imperative-api'; args: [] }
      | { reason: 'keys'; prev: [] | undefined; next: [] | undefined },
  ) => void;
  resetKeys?: [];
  /**
   * logger 实例。默认从 LoggerContext 中读取
   */
  // logger?: Logger;
  logger?: Logger;
  /**
   * 发生错误展示的兜底组件
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FallbackComponent: ComponentType<FallbackProps>;
  /**
   * errorBoundaryName，用于在发生错误时上报
   * 事件：react_error_collection / react_error_by_api_collection
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
      reportJsError: true, // 标记为 JS Error，上报走 slardar.captureException
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
