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

import { useState } from 'react';

import copy from 'copy-to-clipboard';
import { useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { connectorApi } from '@coze-arch/bot-api';
import { useCurrentEnterpriseInfo } from '@coze-foundation/enterprise-store-adapter';

export interface IActionTarget {
  target: 'oauth' | 'platform';
  action: 'create' | 'update' | 'delete' | 'view';
  payload?: Record<string, unknown>;
}

const useCustomPlatformController = () => {
  const { organization_id: organizationId } = useCurrentEnterpriseInfo() ?? {};
  const {
    data: dataSource,
    loading,
    run: doRefreshDatasource,
  } = useRequest(
    async () => {
      try {
        const res = await connectorApi.ListConnector({
          account_id: organizationId,
          page_size: 100,
        });

        return res?.data;
      } catch (error) {
        console.error(error);

        reporter.errorEvent({
          eventName: REPORT_EVENTS.GetCustomPlatList,
          error,
          meta: { error },
        });

        return [];
      }
    },
    {
      manual: !0,
      refreshOnWindowFocus: !0,
    },
  );

  const [actionTarget, setActionTarget] = useState<IActionTarget | undefined>(
    undefined,
  );

  const doCopy = (id: string) => {
    try {
      const res = copy(id);

      if (!res) {
        throw new Error(I18n.t('copy_failed'));
      }

      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
      });
    } catch (error) {
      Toast.warning({
        content: error.message,
        showClose: false,
      });
    }
  };

  return {
    loading,
    dataSource,
    actionTarget,
    doCopy,
    doSetActionTarget: setActionTarget,
    doRefreshDatasource,
  };
};

export { useCustomPlatformController };
