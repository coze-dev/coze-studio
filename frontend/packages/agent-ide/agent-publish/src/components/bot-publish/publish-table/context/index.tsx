import { createContext, useContext } from 'react';

export const PublishTableContext = createContext<{
  refreshTableData: () => void;
  publishLoading: boolean;
}>({
  refreshTableData: () => undefined,
  publishLoading: false,
});
export const usePublishTableContext = () => useContext(PublishTableContext);

export const useRefreshPublishTableData = () =>
  useContext(PublishTableContext).refreshTableData;
