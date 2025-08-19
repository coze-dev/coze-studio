/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RouterProvider } from 'react-router-dom';
import { type FC, useEffect, useState } from 'react';

import { initI18nInstance, I18n } from '@coze-arch/i18n/raw';
import { I18nProvider } from '@coze-arch/i18n/i18n-provider';

import { devRouter } from './routes';

const DevApp: FC = () => {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18nInstance().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return null;
  }

  return (
    <I18nProvider i18n={I18n}>
      <RouterProvider router={devRouter} />
    </I18nProvider>
  );
};

export default DevApp;
