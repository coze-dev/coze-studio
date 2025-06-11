import React, { Suspense, lazy, forwardRef } from 'react';

import type { FormCoreProps, FormCoreRef } from './form-core';

const LazyComponent = lazy(async () => await import('./form-core'));

export const LazyFormCore = forwardRef<FormCoreRef, FormCoreProps>(
  (props, ref) => (
    <Suspense fallback={null}>
      <LazyComponent ref={ref} {...props} />
    </Suspense>
  ),
);
