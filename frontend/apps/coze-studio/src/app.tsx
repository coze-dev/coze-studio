import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';

import { Spin } from '@coze/coze-design';

import { router } from './routes';

export function App() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Spin spinning style={{ height: '100%', width: '100%' }} />
        </div>
      }
    >
      <RouterProvider router={router} fallbackElement={<div>loading...</div>} />
    </Suspense>
  );
}
