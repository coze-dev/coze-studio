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

import React, { useEffect, useState } from 'react';

import { Spin } from '@coze-arch/coze-design';
import { useIDEService } from '@coze-project-ide/framework';

import { AppContribution } from '../../plugins/create-app-plugin/app-contribution';

import css from './index.module.less';

export const GlobalLoading = () => {
  const [ready, setReady] = useState(false);
  const app = useIDEService<AppContribution>(AppContribution);

  useEffect(() => {
    const disposable = app.onStarted(() => {
      setReady(true);
    });
    return () => disposable.dispose();
  }, [app]);

  if (ready) {
    return null;
  }

  return (
    <div className={css['global-loading']}>
      <Spin />
    </div>
  );
};
