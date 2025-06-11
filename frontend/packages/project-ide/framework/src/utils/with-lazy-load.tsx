import React, { Suspense, lazy } from 'react';

const withLazyLoad = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ReactNode,
) => {
  const Component = lazy(importFunc);
  const LazyComponent = () => (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
  return LazyComponent;
};

export { withLazyLoad };
