import { reporter as infraReporter } from '@coze-arch/logger';
const namespace = 'workflow';

/**
 * 流程使用的 slardar 上报实例
 */
export const reporter = infraReporter.createReporterWithPreset({
  namespace,
});

/**
 * 异常捕获，会被当js error上报
 * @param exception
 * @param importErrorInfo
 */
export function captureException(exception: Error) {
  infraReporter.slardarInstance?.('captureException', exception, {
    isErrorBoundary: 'false',
    namespace,
  });
}
