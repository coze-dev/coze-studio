import { useService } from '@flowgram-adapter/free-layout-editor';

import { TestRunReporterService } from '../plugins/test-run-plugin';

export const useTestRunReporterService = () =>
  useService<TestRunReporterService>(TestRunReporterService);
