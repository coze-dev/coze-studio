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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useMemo } from 'react';

import copy from 'copy-to-clipboard';
import { useMemoizedFn, useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { AppType } from '@coze-arch/idl/pat_permission_api';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import {
  type UpdateConnectorRequest,
  type CreateConnectorRequest,
  type DeleteConnectorRequest,
} from '@coze-arch/bot-api/connector_api';
import {
  PlaygroundApi,
  connectorApi,
  patPermissionApi,
} from '@coze-arch/bot-api';
import {
  useIsCurrentPersonalEnterprise,
  useCurrentEnterpriseInfo,
} from '@coze-foundation/enterprise-store-adapter';

// eslint-disable-next-line max-lines-per-function
const useCustomPlatformSettingModalController = (
  successCb: (
    token?: string,
    params?:
      | CreateConnectorRequest
      | UpdateConnectorRequest
      | DeleteConnectorRequest,
  ) => void,
  failCb?: () => void,
) => {
  const { organization_id: organizationId } = useCurrentEnterpriseInfo() ?? {};
  const isPersonalEnterprise = useIsCurrentPersonalEnterprise();

  const {
    loading: isLoadingSpace,
    run: doAsyncGetSpaceList,
    data: spaceDatasource,
  } = useRequest(
    async () => {
      try {
        const res = await PlaygroundApi.GetSpaceListV2();

        return res?.data?.bot_space_list;
      } catch (error) {
        console.error(error);

        reporter.errorEvent({
          eventName: REPORT_EVENTS.GetSpaceListFromCustomPlat,
          error,
          meta: { error },
        });

        return [];
      }
    },
    {
      manual: true,
    },
  );

  const spaceOptionList = useMemo(
    () =>
      spaceDatasource?.map(spaceItem => ({
        label: spaceItem.name,
        value: spaceItem.id,
        disabled:
          spaceItem?.role_type !== SpaceRoleType.Owner &&
          spaceItem?.role_type !== SpaceRoleType.Admin,
      })),
    [spaceDatasource],
  );

  const {
    data: oauthDatasource,
    loading: isLoadingOauthDatasource,
    run: doAsyncGetOauthData,
  } = useRequest(
    async () => {
      try {
        const res = await patPermissionApi.ListAppMeta(
          isPersonalEnterprise
            ? {}
            : {
                organization_id: organizationId,
              },
        );

        return res?.data?.apps ?? [];
      } catch (error) {
        console.error(error);

        reporter.errorEvent({
          eventName: REPORT_EVENTS.GetOauthAppListFromCustomPlat,
          error,
          meta: { error },
        });

        return [];
      }
    },
    {
      refreshDeps: [isPersonalEnterprise, organizationId],
    },
  );

  const oauthOptionsList = useMemo(
    () =>
      oauthDatasource?.map(oauthItem => ({
        label: `${oauthItem.name}(ID: ${oauthItem.appid})`,
        value: oauthItem.appid,
        disabled:
          !!oauthItem?.connector?.connector_id ||
          oauthItem?.app_type === AppType.normal,
      })),
    [oauthDatasource],
  );

  const { loading: isCreating, runAsync: doAsyncCreate } = useRequest(
    async (values: CreateConnectorRequest) =>
      await connectorApi.CreateConnector({
        ...values,
        account_id: organizationId,
      }),
    { manual: !0 },
  );

  const { loading: isUpdating, runAsync: doAsyncUpdate } = useRequest(
    async (values: UpdateConnectorRequest) =>
      await connectorApi.UpdateConnector(values),
    { manual: !0 },
  );

  const { loading: isDeleting, runAsync: doAsyncDelete } = useRequest(
    async (values: DeleteConnectorRequest) => {
      await connectorApi.DeleteConnector(values);
    },
    { manual: !0 },
  );

  const doCreate = useMemoizedFn(async (values: CreateConnectorRequest) => {
    try {
      const res = await doAsyncCreate(values);

      successCb(res?.callback_token, values);
    } catch (error) {
      console.error(error);

      reporter.errorEvent({
        eventName: REPORT_EVENTS.CreateCustomPlat,
        error,
        meta: { error },
      });

      failCb?.();
    }
  });

  const doUpdate = useMemoizedFn(async (values: UpdateConnectorRequest) => {
    try {
      const res = await doAsyncUpdate(values);

      successCb(res?.callback_token, values);
    } catch (error) {
      console.error(error);

      reporter.errorEvent({
        eventName: REPORT_EVENTS.UpdateCustomPlat,
        error,
        meta: { error },
      });

      failCb?.();
    }
  });

  const doDel = useMemoizedFn(async (values: DeleteConnectorRequest) => {
    try {
      await doAsyncDelete(values);

      successCb(undefined, values);
    } catch (error) {
      console.error(error);

      reporter.errorEvent({
        eventName: REPORT_EVENTS.DeleteCustomPlat,
        error,
        meta: { error },
      });

      failCb?.();
    }
  });

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

  useEffect(() => {
    doAsyncGetSpaceList();
  }, []);

  return {
    oauthOptionsList,
    spaceOptionList,
    isLoadingSpace,
    isLoadingOauthDatasource,
    isIdle: !isCreating && !isDeleting && !isUpdating,
    doDel,
    doUpdate,
    doCreate,
    doAsyncGetOauthData,
    doAsyncGetSpaceList,
    doCopy,
  };
};

export { useCustomPlatformSettingModalController };
