import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';

import slardar from '@slardar/web';
import { reporter } from '@coze-arch/logger';

import { Page1 } from './pages/page1';
import { MainPage } from './pages/main';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { path: 'page1', element: <Page1 /> },
      { path: '', element: <MainPage /> },
      { path: '*', element: <div>404</div> },
    ],
  },
]);

export function App() {
  useEffect(() => {
    reporter.info({ message: 'Ok fine' });
    reporter.init(slardar);
  }, []);

  return <RouterProvider router={router} />;
}
