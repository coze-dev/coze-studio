import { createContext, type PropsWithChildren } from 'react';

import { useRequest } from 'ahooks';

import {
  type ReportMessageFeedbackFn,
  type ReportMessageFeedbackFnProviderProps,
} from './type';

export const ReportMessageFeedbackFnContext =
  createContext<ReportMessageFeedbackFn | null>(null);

export const ReportMessageFeedbackFnProvider: React.FC<
  PropsWithChildren<ReportMessageFeedbackFnProviderProps>
> = ({ children, reportMessageFeedback }) => {
  const { runAsync: asyncReportMessage } = useRequest(reportMessageFeedback, {
    manual: true,
  });

  return (
    <ReportMessageFeedbackFnContext.Provider value={asyncReportMessage}>
      {children}
    </ReportMessageFeedbackFnContext.Provider>
  );
};
