import { GlobalLayout, useAppInit } from '@coze-foundation/global-adapter';

export const Layout = () => {
  useAppInit();

  return <GlobalLayout />;
};
