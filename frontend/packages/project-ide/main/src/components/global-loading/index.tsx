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
