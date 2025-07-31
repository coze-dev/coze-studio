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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import { useErrorHandler } from '@coze-arch/logger';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type APIParameter } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import {
  addDepthAndValue,
  doRemoveDefaultFromResponseParams,
  initParamsDefault,
  updateNodeById,
} from '../../components/plugin_modal/utils';
import { ROWKEY } from '../../components/plugin_modal/config';

export interface SettingParamsProps {
  botId?: string;
  pluginId?: string;
  devId?: string;
  apiName?: string;
}

const useParametersInSettingModalController = (props: SettingParamsProps) => {
  const capture = useErrorHandler();
  const [isUpdateLoading, setIsUpdateLoading] = useState(!!0);
  const [requestParams, setRequestParams] = useState<Array<APIParameter>>([]);
  const [responseParams, setResponseParams] = useState<Array<APIParameter>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loaded, setLoaded] = useState(!!0);
  const commonParams = useMemo(
    () => ({
      bot_id: props.botId || '',
      dev_id: props.devId || '',
      plugin_id: props.pluginId || '',
      api_name: props.apiName || '',
      space_id: useSpaceStore.getState().getSpaceId(),
    }),
    [props],
  );

  const getColumnClass = (record: APIParameter) =>
    record.global_disable ? 'disable' : 'normal';

  const handleOpen = async () => {
    try {
      const { request_params, response_params } =
        await PluginDevelopApi.GetBotDefaultParams({
          ...commonParams,
        });
      if (request_params && response_params) {
        const reqParams = initParamsDefault(request_params, 'local_default');
        addDepthAndValue(response_params);
        addDepthAndValue(reqParams, 'local_default');
        setRequestParams(reqParams);
        const resParams = initParamsDefault(response_params, 'local_default');
        setResponseParams(resParams);
        setLoaded(true);
      }
    } catch (error) {
      setLoaded(true);
      capture(error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdateLoading(!0);

    await PluginDevelopApi.UpdateBotDefaultParams({
      ...commonParams,
      request_params: requestParams,
      response_params: doRemoveDefaultFromResponseParams(responseParams, false),
    });

    setIsUpdateLoading(!!0);
  };

  const updateNodeWithData = ({
    record,
    key,
    value,
    isForResponse = false,
  }: {
    record: APIParameter;
    key: string;
    value: any;
    isForResponse?: boolean;
  }) => {
    updateNodeById({
      data: isForResponse ? responseParams : requestParams,
      targetKey: record[ROWKEY] as string,
      field: key,
      value,
    });
    const cloneData = cloneDeep(isForResponse ? responseParams : requestParams);
    isForResponse ? setResponseParams(cloneData) : setRequestParams(cloneData);
  };

  useEffect(() => {
    handleOpen();
  }, []);

  return {
    doSetActive: setActiveTab,
    doSetReqParams: setRequestParams,
    doUpdateParams: handleUpdate,
    doUpdateNodeWithData: updateNodeWithData,
    getColumnClass,
    loaded,
    activeTab,
    responseParams,
    requestParams,
    isUpdateLoading,
  };
};

export { useParametersInSettingModalController };
