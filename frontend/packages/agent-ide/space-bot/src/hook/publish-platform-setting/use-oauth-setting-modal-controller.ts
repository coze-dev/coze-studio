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

import { useMemoizedFn, useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type UpdateOauthConfigRequest } from '@coze-arch/bot-api/connector_api';
import { connectorApi } from '@coze-arch/bot-api';

import { type IActionTarget } from './use-custom-platform-controller';

const useOauthSettingModalController = (
  actionTarget: IActionTarget,
  successCb: () => void,
  failCb?: () => void,
) => {
  const { data: oauthFormConfig, loading: isOauthConfigLoading } = useRequest(
    async () => {
      try {
        const configRes = await connectorApi.GetOauthConfigSchema();

        return configRes?.oauth_schema;
      } catch (error) {
        console.error(error);

        reporter.errorEvent({
          eventName: REPORT_EVENTS.GetOauthConfig,
          error,
          meta: { error },
        });
      }
    },
    {
      ready:
        actionTarget?.target === 'oauth' && actionTarget?.action === 'update',
    },
  );

  const oauthFormItemConfigs = oauthFormConfig?.schema_area?.schema_list ?? [];

  const oauthModalDesc = oauthFormConfig?.schema_area?.description
    ? oauthFormConfig?.schema_area?.description
    : I18n.t('coze_custom_publish_platform_43');

  const oauthModalTitle = oauthFormConfig?.schema_area?.title_text
    ? oauthFormConfig?.schema_area?.title_text
    : I18n.t('coze_custom_publish_platform_42');

  const { runAsync, loading: isUpdateOauthConfigLoading } = useRequest(
    async (values: UpdateOauthConfigRequest) => {
      await connectorApi.UpdateOauthConfig(values);
    },
    { manual: !0 },
  );

  const doUpdate = useMemoizedFn(async (values: UpdateOauthConfigRequest) => {
    try {
      await runAsync(values);

      successCb();
    } catch (error) {
      console.error(error);

      reporter.errorEvent({
        eventName: REPORT_EVENTS.UpdateCustomPlatOauthConfig,
        error,
        meta: { error },
      });

      failCb?.();
    }
  });

  return {
    isOauthConfigLoading,
    isUpdateOauthConfigLoading,
    oauthModalTitle,
    oauthModalDesc,
    oauthFormItemConfigs,
    doUpdate,
  };
};

export { useOauthSettingModalController };
