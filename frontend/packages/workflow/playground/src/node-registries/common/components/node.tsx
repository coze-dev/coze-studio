import { type PropsWithChildren } from 'react';

import { PublicScopeProvider } from '@coze-workflow/variable';

import { Header } from './header';

export function Node({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <PublicScopeProvider>
        <>{children}</>
      </PublicScopeProvider>
    </>
  );
}
