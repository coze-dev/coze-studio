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

import { type FC, useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { cloneDeep } from 'lodash-es';
import { useUpdateEffect } from 'ahooks';
import { usePluginStore } from '@coze-studio/bot-plugin-store';
import {
  REPORT_EVENTS,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { Spin, Collapse } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import {
  type APIParameter,
  type PluginAPIInfo,
  DebugExampleStatus,
  type UpdateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { addDepthAndValue } from '@coze-agent-ide/bot-plugin-tools/pluginModal/utils';
import { type RenderEnhancedComponentProps } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { setEditToolExampleValue } from '@coze-agent-ide/bot-plugin-tools/example/utils';

import { useContentResponse } from './use-content-response';
import { useContentRequest } from './use-content-request';
import { useContentBaseInfo } from './use-content-baseinfo';
import { useContentBaseMore } from './use-content-base-more';
import { ToolHeader } from './tool-header';

import s from './index.module.less';

export interface ToolDetailPageProps
  extends Partial<RenderEnhancedComponentProps> {
  toolID: string;
  onDebugSuccessCallback?: () => void;
}

// Page - Edit Plugin API
export const ToolDetailPage: FC<ToolDetailPageProps> = ({
  toolID,
  onDebugSuccessCallback,
  renderDescComponent,
  renderParamsComponent,
}) => {
  //Capture error messages and jump to the unified landing page
  const capture = useErrorHandler();
  const [editVersion, setEditVersion] = useState<number>();
  //Plugin-API Details
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>();
  const [debugApiInfo, setDebugApiInfo] = useState<PluginAPIInfo>();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    canEdit,
    init,
    pluginInfo,
    updatedInfo,
    wrapWithCheckLock,
    unlockPlugin,
    spaceID,
    pluginID,
    updatePluginInfoByImmer,
    version,
  } = usePluginStore(
    useShallow(store => ({
      canEdit: store.canEdit,
      init: store.init,
      pluginInfo: store.pluginInfo,
      updatedInfo: store.updatedInfo,
      wrapWithCheckLock: store.wrapWithCheckLock,
      unlockPlugin: store.unlockPlugin,
      spaceID: store.spaceID,
      pluginID: store.pluginId,
      updatePluginInfoByImmer: store.updatePluginInfoByImmer,
      version: store.version,
    })),
  );

  const handleSuccess = (baseResData: UpdateAPIResponse) => {
    updatePluginInfoByImmer(draft => {
      if (!draft) {
        return;
      }
      draft.edit_version = baseResData?.edit_version;
    });
  };

  // Reset request parameters
  const resetRequestParams = (data: PluginAPIInfo) => {
    const requestParams = cloneDeep(data.request_params as APIParameter[]);
    if (
      data?.debug_example_status === DebugExampleStatus.Enable &&
      data?.debug_example?.req_example
    ) {
      setEditToolExampleValue(
        requestParams,
        JSON.parse((data as PluginAPIInfo)?.debug_example?.req_example ?? '{}'),
      );
    }
    addDepthAndValue(requestParams);
    return requestParams;
  };

  // Set interface information (echo and empty)
  const handleInit = async (useloading = false) => {
    setApiInfo({
      ...apiInfo,
      debug_example_status: DebugExampleStatus.Disable,
    });
    useloading && setLoading(true);
    try {
      const {
        api_info = [],
        msg,
        edit_version,
      } = await PluginDevelopApi.GetPluginAPIs({
        plugin_id: pluginID,
        api_ids: [toolID],
        preview_version_ts: version,
      });

      if (api_info.length > 0) {
        const apiInfoTemp = api_info.length > 0 ? api_info[0] : {};
        // Debug data, if there is an example, the imported parameter data needs to be echoed for additional processing
        setDebugApiInfo({
          ...apiInfoTemp,
          request_params: resetRequestParams(apiInfoTemp),
        });
        // Adding hierarchical identifiers to objects
        addDepthAndValue(apiInfoTemp.request_params);
        addDepthAndValue(apiInfoTemp.response_params);
        setApiInfo(apiInfoTemp);
        setEditVersion(edit_version);
      } else {
        capture(
          new CustomError(
            ReportEventNames.responseValidation,
            msg || 'GetPluginAPIs error',
          ),
        );
      }
    } catch (error) {
      capture(
        new CustomError(
          REPORT_EVENTS.PluginInitError,
          // @ts-expect-error -- linter-disable-autofix
          `plugin init error: ${error.message}`,
        ),
      );
    }
    useloading && setLoading(false);
  };

  // 1. Basic information
  const {
    isBaseInfoDisabled,
    header: baseInfoHeader,
    itemKey: baseInfoItemKey,
    extra: baseInfoExtra,
    content: baseInfoContent,
    classNameWrap: baseInfoClassNameWrap,
  } = useContentBaseInfo({
    space_id: spaceID,
    plugin_id: pluginID,
    tool_id: toolID,
    apiInfo,
    canEdit,
    handleInit,
    wrapWithCheckLock,
    editVersion,
    renderDescComponent,
  });

  // 2 more settings
  const {
    isBaseMoreDisabled,
    header: baseMoreHeader,
    itemKey: baseMoreItemKey,
    extra: baseMoreExtra,
    content: baseMoreContent,
    classNameWrap: baseMoreClassNameWrap,
  } = useContentBaseMore({
    plugin_id: pluginID,
    pluginInfo,
    tool_id: toolID,
    apiInfo,
    canEdit,
    handleInit,
    wrapWithCheckLock,
    editVersion,
    space_id: spaceID,
    onSuccess: handleSuccess,
  });

  // 3. Set request
  const {
    isRequestParamsDisabled,
    itemKey: requestItemKey,
    header: requestHeader,
    extra: requestExtra,
    content: requestContent,
    classNameWrap: requestClassNameWrap,
  } = useContentRequest({
    apiInfo,
    plugin_id: pluginID,
    tool_id: toolID,
    pluginInfo,
    canEdit,
    handleInit,
    wrapWithCheckLock,
    editVersion,
    spaceID,
    onSuccess: handleSuccess,
    renderParamsComponent,
  });

  // 4. Set up the response
  const {
    isResponseParamsDisabled,
    itemKey: responseItemKey,
    header: responseHeader,
    extra: responseExtra,
    content: responseContent,
    classNameWrap: responseClassNameWrap,
  } = useContentResponse({
    apiInfo,
    plugin_id: pluginID,
    tool_id: toolID,
    editVersion,
    pluginInfo,
    canEdit,
    handleInit,
    wrapWithCheckLock,
    debugApiInfo,
    setDebugApiInfo,
    spaceID,
    onSuccess: handleSuccess,
    renderParamsComponent,
  });

  const collapseItems = [
    {
      header: baseInfoHeader,
      itemKey: baseInfoItemKey,
      extra: baseInfoExtra,
      content: baseInfoContent,
      classNameWrap: baseInfoClassNameWrap,
    },
    {
      header: baseMoreHeader,
      itemKey: baseMoreItemKey,
      extra: baseMoreExtra,
      content: baseMoreContent,
      classNameWrap: baseMoreClassNameWrap,
    },
    {
      header: requestHeader,
      itemKey: requestItemKey,
      extra: requestExtra,
      content: requestContent,
      classNameWrap: requestClassNameWrap,
    },
    {
      header: responseHeader,
      itemKey: responseItemKey,
      extra: responseExtra,
      content: responseContent,
      classNameWrap: responseClassNameWrap,
    },
  ];

  useEffect(() => {
    (async () => {
      await init();
      handleInit(true);
    })();
    return () => {
      unlockPlugin();
    };
  }, []);

  // The preview state is unlocked. If there is an edit state, it will not be unlocked.
  useUpdateEffect(() => {
    if (
      !isBaseInfoDisabled ||
      !isRequestParamsDisabled ||
      !isResponseParamsDisabled ||
      !isBaseMoreDisabled
    ) {
      return;
    }
    unlockPlugin();
  }, [
    isBaseInfoDisabled,
    isRequestParamsDisabled,
    isResponseParamsDisabled,
    isBaseMoreDisabled,
  ]);

  return !loading ? (
    <div className={s.toolWrap}>
      <ToolHeader
        space_id={spaceID}
        plugin_id={pluginID}
        unlockPlugin={unlockPlugin}
        tool_id={toolID}
        pluginInfo={pluginInfo}
        updatedInfo={updatedInfo}
        apiInfo={apiInfo}
        editVersion={editVersion || 0}
        canEdit={canEdit}
        debugApiInfo={debugApiInfo}
        onDebugSuccessCallback={onDebugSuccessCallback}
      />
      <Collapse
        keepDOM={true}
        defaultActiveKey={collapseItems.map(item => item.itemKey)}
      >
        {collapseItems.map((item, index) => (
          <Collapse.Panel
            className={item.classNameWrap}
            header={item.header}
            itemKey={item.itemKey}
            extra={item.extra}
            key={`${index}collapse`}
          >
            {item.content}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  ) : (
    <Spin size="large" spinning style={{ height: '100%', width: '100%' }} />
  );
};
