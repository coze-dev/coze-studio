import { createBrowserRouter } from 'react-router-dom';

import { Page2 } from '@/pages/page2';
import { Page1 } from '@/pages/page1';
import App from '@/App';

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: 'page1',
          element: <Page1 />,
        },
        {
          path: 'page2',
          element: <Page2 />,
        },
      ],
    },
  ]);
