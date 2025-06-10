export const TestRunService = Symbol('TestRunService');

export interface TestRunService {
  /**
   * 停止试运行
   */
  pauseTestRun: () => void;
  /**
   * 继续试运行
   */
  continueTestRun: () => void;
}
