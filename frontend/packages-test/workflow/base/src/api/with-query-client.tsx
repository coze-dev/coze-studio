import React, { type FC } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const workflowQueryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
export function withQueryClient<T extends FC<any>>(Component: T): T {
  return function WrappedComponent(props) {
    return (
      <QueryClientProvider client={workflowQueryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  } as T;
}
