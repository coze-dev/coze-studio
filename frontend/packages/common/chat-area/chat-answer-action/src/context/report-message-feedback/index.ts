import { useContext } from 'react';

import { ReportMessageFeedbackFnContext } from './context';

export { ReportMessageFeedbackFnProvider } from './context';

export const useReportMessageFeedbackFn = () => {
  const reportMessageFeedbackFn = useContext(ReportMessageFeedbackFnContext);
  if (!reportMessageFeedbackFn) {
    throw new Error('reportMessageFeedbackFn not provided');
  }
  return reportMessageFeedbackFn;
};
