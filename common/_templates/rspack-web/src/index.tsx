import { RouterProvider } from 'react-router-dom';

import { createRoot } from 'react-dom/client';
import browserClient from '@slardar/web'; // 默认引入的是CN地区的
import { reporter } from '@coze-arch/logger';

import { router } from '@/router';

browserClient('init', {
  // TODO: your slardar bid
  bid: '',
});
browserClient('start');
reporter.init(browserClient)

const root = createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);
