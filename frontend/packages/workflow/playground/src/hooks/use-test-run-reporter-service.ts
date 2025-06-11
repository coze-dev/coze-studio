import { useService } from '@flowgram-adapter/free-layout-editor';

import { TestRunReporterService } from '@/services';

export const useTestRunReporterService = () =>
  useService<TestRunReporterService>(TestRunReporterService);
