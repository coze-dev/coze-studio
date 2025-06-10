import { createRoot } from 'react-dom/client';
import { initI18nInstance } from '@coze-arch/i18n/raw';
import { dynamicImportMdBoxStyle } from '@coze-arch/bot-md-box-adapter/style';
import { pullFeatureFlags, type FEATURE_FLAGS } from '@coze-arch/bot-flags';

import { App } from './app';
// import '@coze-common/assets/style/index.less';
import './global.less';
import './index.less';

const initFlags = () => {
  pullFeatureFlags({
    timeout: 1000 * 4,
    fetchFeatureGating: () => Promise.resolve({} as unknown as FEATURE_FLAGS),
  });
};

const main = () => {
  initFlags();
  initI18nInstance({
    lng: IS_OVERSEA ? 'en' : 'zh-CN',
  });
  dynamicImportMdBoxStyle();
  const $root = document.getElementById('root');
  if (!$root) {
    throw new Error('root element not found');
  }
  const root = createRoot($root);

  root.render(<App />);
};

main();
