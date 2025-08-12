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

import { useEffect, useState } from 'react';

import { useMemoizedFn, useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import {
  type PersonalAccessToken,
  type CreatePersonalAccessTokenAndPermissionRequest,
  type UpdatePersonalAccessTokenAndPermissionRequest,
  type CreatePersonalAccessTokenAndPermissionResponseData,
  type GetPersonalAccessTokenAndPermissionResponseData,
  type ListPersonalAccessTokensResponse2,
} from '@coze-arch/bot-api/pat_permission_api';
import { patPermissionApi } from '@coze-arch/bot-api';

export type FetchCustomPatList =
  () => Promise<ListPersonalAccessTokensResponse2>;
export const useGetPATList = ({
  fetchCustomPatList,
}: {
  fetchCustomPatList?: FetchCustomPatList;
}) => {
  const [dataSource, setDataSource] = useState<PersonalAccessToken[]>([]);
  const fetchPatList = useMemoizedFn(() => {
    if (fetchCustomPatList) {
      return fetchCustomPatList();
    }
    return patPermissionApi.ListPersonalAccessTokens({});
  });
  const { loading, run: fetchData } = useRequest(fetchPatList, {
    manual: true,
    onSuccess: dataSourceData => {
      setDataSource(dataSourceData?.data?.personal_access_tokens);
      reporter.event({
        eventName: REPORT_EVENTS.openGetPatList,
        meta: {
          level: 'success',
          action: 'ListPersonalAccessTokens',
        },
      });
    },
    onError: error => {
      reporter.errorEvent({
        eventName: REPORT_EVENTS.openGetPatList,
        error,
        meta: {
          action: 'ListPersonalAccessTokens',
        },
      });
    },
  });

  return {
    dataSource,
    loading,
    fetchData,
  };
};

export const useCreatePAT = () => {
  const [successData, setSuccessData] =
    useState<CreatePersonalAccessTokenAndPermissionResponseData>();
  const { loading, run: runCreate } = useRequest(
    (info: CreatePersonalAccessTokenAndPermissionRequest) =>
      patPermissionApi.CreatePersonalAccessTokenAndPermission(info),
    {
      manual: true,
      onSuccess: dataSourceData => {
        setSuccessData(dataSourceData?.data);
        reporter.event({
          eventName: REPORT_EVENTS.openPatAction,
          meta: {
            level: 'success',
            action: 'CreatePersonalAccessTokenAndPermission',
          },
        });
      },
      onError: error => {
        reporter.errorEvent({
          eventName: REPORT_EVENTS.openPatAction,
          error,
          meta: {
            action: 'CreatePersonalAccessTokenAndPermission',
          },
        });
      },
    },
  );
  return {
    runCreate,
    loading,
    successData,
  };
};

export const useUpdatePAT = (
  handle: {
    successHandle?: () => void;
  } = {},
) => {
  const {
    loading,
    run: runUpdate,
    data: updateSuccessData,
  } = useRequest(
    (info: UpdatePersonalAccessTokenAndPermissionRequest) =>
      patPermissionApi.UpdatePersonalAccessTokenAndPermission(info),
    {
      manual: true,
      onSuccess: () => {
        handle?.successHandle?.();
        reporter.event({
          eventName: REPORT_EVENTS.openPatAction,
          meta: {
            level: 'success',
            action: 'UpdatePersonalAccessTokenAndPermission',
          },
        });
      },
      onError: error => {
        reporter.errorEvent({
          eventName: REPORT_EVENTS.openPatAction,
          error,
          meta: {
            action: 'UpdatePersonalAccessTokenAndPermission',
          },
        });
      },
    },
  );
  return {
    runUpdate,
    loading,
    updateSuccessData,
  };
};

export const useDeletePAT = ({
  successHandle,
}: {
  successHandle: () => void;
}) => {
  const { loading, runAsync } = useRequest(
    (id: string) =>
      patPermissionApi.DeletePersonalAccessTokenAndPermission({ id }),
    {
      manual: true,
    },
  );
  const runDelete = async (id: string) => {
    try {
      await runAsync(id);
      successHandle();
      reporter.event({
        eventName: REPORT_EVENTS.openPatAction,
        meta: {
          level: 'success',
          action: 'DeletePersonalAccessTokenAndPermission',
        },
      });
    } catch (error) {
      reporter.errorEvent({
        eventName: REPORT_EVENTS.openPatAction,
        error: error as Error,
        meta: {
          action: 'DeletePersonalAccessTokenAndPermission',
        },
      });
    }
  };

  return {
    runDelete,
    loading,
  };
};
export const usePATPermission = ({ patId }: { patId?: string }) => {
  const [patPermission, setPatPermission] =
    useState<GetPersonalAccessTokenAndPermissionResponseData>();

  const { error: detailError, run } = useRequest(
    (id: string) =>
      patPermissionApi.GetPersonalAccessTokenAndPermission({ id }),
    {
      manual: true,
      onSuccess: dataSourceData => {
        setPatPermission(dataSourceData.data);

        reporter.event({
          eventName: REPORT_EVENTS.openGetPatList,
          meta: {
            level: 'success',
            action: 'GetPersonalAccessTokenAndPermission',
          },
        });
      },
      onError: error => {
        reporter.errorEvent({
          eventName: REPORT_EVENTS.openGetPatList,
          error,
          meta: {
            action: 'GetPersonalAccessTokenAndPermission',
          },
        });
      },
    },
  );
  useEffect(() => {
    if (patId) {
      run(patId);
    } else {
      setPatPermission(undefined);
    }
  }, [patId]);

  return {
    patPermission,
    detailError,
  };
};
