export enum TestRunStatus {
  success = 'success',
  failed = 'failed',
}

export interface NodeTestRunResult {
  status: TestRunStatus;
  duration: number;
  input: string | null;
  output: string | null;
}
