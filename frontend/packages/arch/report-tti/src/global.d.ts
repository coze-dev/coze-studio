/// <reference types='@coze-arch/bot-typings' />

declare interface Window {
  // 运行 e2e 时会注入这个全局方法
  REPORT_TTI_FOR_E2E?: (
    timestamp: number,
    performanceEntry: PerformanceEntryList,
  ) => void;
}
