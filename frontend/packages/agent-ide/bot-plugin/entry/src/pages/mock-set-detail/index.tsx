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
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, type FC } from 'react';

import queryString from 'query-string';
import classNames from 'classnames';
import { userStoreService } from '@coze-studio/user-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { useSpace } from '@coze-arch/foundation-sdk';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { Space, UIButton, UILayout, Toast } from '@coze-arch/bot-semi';
import {
  type PluginAPIInfo,
  SpaceType,
} from '@coze-arch/bot-api/developer_api';
import {
  type ComponentSubject,
  ComponentType,
  type infra,
  type MockSet,
} from '@coze-arch/bot-api/debugger_api';
import { PluginDevelopApi, debuggerApi } from '@coze-arch/bot-api';
import { getEnvironment } from '@coze-studio/mockset-shared';
import { IconCloseNoCycle } from '@coze-arch/bot-icons';
import { PageType, usePageJumpResponse } from '@coze-arch/bot-hooks';
import {
  safeJSONParse,
  getUsedScene,
} from '@coze-agent-ide/bot-plugin-mock-set/util';
import { MockSetIntro } from '@coze-agent-ide/bot-plugin-mock-set/mock-set-intro';
import { CONNECTOR_ID } from '@coze-agent-ide/bot-plugin-mock-set/mock-set/const';
import { MockSetPageBreadcrumb } from '@coze-agent-ide/bot-plugin-mock-set/mock-data-page-breadcrumb';
import {
  MockDataList,
  type MockDataListActions,
} from '@coze-agent-ide/bot-plugin-mock-set/mock-data-list';

import s from './index.module.less';

enum PageSource {
  FROM_BOT = 'bot',
  FROM_WORKFLOW = 'workflow',
  FROM_MOCK_SET = 'mock_set',
}

enum PageMode {
  /** Full page UI similar to full coverage floating layer */
  FULL_PAGE = 'full_page',
  /** Embed (with menu bar on the left) */
  EMBED = 'embed',
}

const MockSetDetail: FC<{
  toolID: string;
  mocksetID: string;
  pluginID: string;
  spaceID: string;
  version?: string;
}> = ({ toolID, mocksetID, pluginID, spaceID, version }) => {
  const params = useMemo(
    () =>
      queryString.parse(location.search) as {
        hideMenu: string;
      },
    [],
  );
  const routeResponse = usePageJumpResponse(PageType.PLUGIN_MOCK_DATA);
  // API Details
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>({
    name: routeResponse?.toolName,
  });
  // Mock set details
  const [mockSetInfo, setMockSetInfo] = useState<MockSet>({
    id: mocksetID,
    name: routeResponse?.mockSetName,
  });
  // API correspondence schema
  const [toolSchema, setToolSchema] = useState<string>('');
  const [perm, setPerm] = useState<{
    readOnly: boolean;
    uninitialized: boolean;
  }>({
    readOnly: true,
    uninitialized: true,
  });

  const listRef = useRef<MockDataListActions>(null);
  const contentEleRef = useRef<HTMLDivElement>(null);

  // page display mode
  const pageMode = params.hideMenu ? PageMode.FULL_PAGE : PageMode.EMBED;
  // page source
  const fromSource = routeResponse?.fromSource
    ? (routeResponse.fromSource as PageSource)
    : PageSource.FROM_MOCK_SET;
  const [listLength, setListLength] = useState(0);

  const userInfo = userStoreService.useUserInfo();

  const space = useSpace(spaceID);
  const isPersonal = space?.space_type === SpaceType.Personal;
  const navigate = useNavigate();

  const bizCtx = useMemo(
    () => ({
      connectorID: CONNECTOR_ID,
      connectorUID: userInfo?.user_id_str,
      bizSpaceID: spaceID,
    }),
    [CONNECTOR_ID, userInfo, spaceID],
  );

  const mockSubject = useMemo(
    () => ({
      componentType: ComponentType.CozeTool,
      componentID: toolID,
      parentComponentType: ComponentType.CozePlugin,
      parentComponentID: pluginID,
    }),
    [toolID, pluginID],
  );

  // Get current tool information
  const getPluginToolInfo = async () => {
    try {
      const { api_info = [] } = await PluginDevelopApi.GetPluginAPIs(
        {
          plugin_id: pluginID,
          api_ids: [toolID],
          preview_version_ts: version,
        },
        { __disableErrorToast: true },
      );

      if (api_info.length > 0) {
        const apiInfoTemp = api_info.length > 0 ? api_info[0] : {};
        setApiInfo(apiInfoTemp);
      }
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error, eventName: 'get_tool_info_fail' });
    }
  };

  // Get current mock set information
  const getMockSetInfo = async () => {
    if (!mocksetID) {
      return;
    }
    try {
      const data = await debuggerApi.MGetMockSet({
        bizCtx,
        mockSubject,
        ids: [mocksetID],
        pageLimit: 1,
      });

      if (data.mockSets?.[0]) {
        setMockSetInfo(data.mockSets[0]);
      }
      if (data.schema) {
        setToolSchema(data.schema);
      }
      setPerm({
        readOnly: userInfo?.user_id_str !== data.mockSets?.[0]?.creator?.ID,
        uninitialized: false,
      });
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error, eventName: 'get_mockset_info_fail' });
    }
  };

  const updateMockSetInfo = (info?: MockSet) => {
    if (info) {
      setMockSetInfo(cur => ({ ...cur, ...info }));
    }
  };

  const clickAddHandler = () => {
    listRef.current?.create();
  };

  const clickUseHandler = async () => {
    const sourceBizCtx = safeJSONParse<infra.BizCtx>(
      routeResponse?.bizCtx || '',
    );
    const basicParams: ParamsTypeDefine[EVENT_NAMES.use_mockset_front] = {
      environment: getEnvironment(),
      workspace_id: spaceID,
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: toolID,
      status: 1,
      mock_set_id: mocksetID,
      where: getUsedScene(sourceBizCtx?.trafficScene),
    };

    try {
      await debuggerApi.BindMockSet({
        mockSetID: mocksetID,
        bizCtx: sourceBizCtx,
        mockSubject: safeJSONParse<ComponentSubject>(
          routeResponse?.bindSubjectInfo || '',
        ),
      });

      sendTeaEvent(EVENT_NAMES.use_mockset_front, {
        ...basicParams,
        status: 0,
      });

      navigate(-1);
      const text = I18n.t('toolname_used_mockset_mocksetname', {
        toolName: routeResponse?.toolName || '',
        mockSetName: mockSetInfo.name || '',
      });
      text && Toast.success({ content: text, showClose: false });
    } catch (e) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error: e, eventName: 'change_mockset_fail' });
      sendTeaEvent(EVENT_NAMES.use_mockset_front, {
        ...basicParams,
        status: 1,
        // @ts-expect-error -- linter-disable-autofix
        error: e?.msg as string,
      });
    }
  };

  const closeHandler = () => {
    navigate(-1);
  };

  const listUpdateHandler = (num: number, needScrollToTop?: boolean) => {
    setListLength(num);

    if (needScrollToTop) {
      contentEleRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderOperations = () => {
    const operationConfig: {
      label: string;
      handler?: () => void;
      disabled?: boolean;
    }[] = [];

    if (!perm.readOnly && listLength !== 0) {
      operationConfig.push({
        label: I18n.t('add_mock_data'),
        handler: clickAddHandler,
      });
    }

    if (
      fromSource === PageSource.FROM_BOT ||
      fromSource === PageSource.FROM_WORKFLOW
    ) {
      operationConfig.push({
        label: I18n.t(
          fromSource === PageSource.FROM_BOT ? 'use_in_bot' : 'use_in_workflow',
        ),
        handler: clickUseHandler,
        disabled: listLength === 0,
      });
    }

    return operationConfig.map((item, index) => (
      <UIButton
        type={index === operationConfig.length - 1 ? 'primary' : 'tertiary'}
        theme={index === operationConfig.length - 1 ? 'solid' : undefined}
        key={item.label}
        onClick={item.handler}
        disabled={item.disabled}
      >
        {item.label}
      </UIButton>
    ));
  };

  useEffect(() => {
    getMockSetInfo();
  }, []);

  useEffect(() => {
    getPluginToolInfo();
  }, [pluginID, toolID]);

  return (
    <UILayout title={renderHtmlTitle(mockSetInfo.name || I18n.t('mockset'))}>
      {pageMode === PageMode.EMBED ? (
        <MockSetPageBreadcrumb
          pluginId={pluginID}
          apiInfo={apiInfo}
          mockSetInfo={mockSetInfo}
        />
      ) : null}
      <div
        className={classNames(
          s['page-header'],
          pageMode === PageMode.FULL_PAGE ? s['page-header_full'] : '',
        )}
      >
        {pageMode === PageMode.FULL_PAGE ? (
          <UIButton
            className={classNames(s['page-header-back'])}
            icon={<IconCloseNoCycle />}
            onClick={closeHandler}
            theme="borderless"
          />
        ) : null}
        <div
          className={classNames(
            s['page-header-intro'],
            pageMode === PageMode.FULL_PAGE
              ? s['page-header-intro_center']
              : s['page-header-intro_top'],
          )}
        >
          <MockSetIntro
            isFullHeader={pageMode === PageMode.FULL_PAGE}
            mockSetInfo={{
              mockSubject,
              ...mockSetInfo,
            }}
            bizCtx={bizCtx}
            readOnly={perm.readOnly}
            onUpdateMockSetInfo={updateMockSetInfo}
          />
        </div>
        <Space className={classNames(s['page-header-operations'])} spacing={12}>
          {renderOperations()}
        </Space>
      </div>
      <UILayout.Content
        className={classNames(s['layout-content'])}
        ref={contentEleRef}
      >
        <MockDataList
          mockSetID={mocksetID}
          toolSchema={toolSchema}
          perm={perm}
          ref={listRef}
          bizCtx={bizCtx}
          onListUpdate={listUpdateHandler}
        />
      </UILayout.Content>
    </UILayout>
  );
};

export { MockSetDetail };
