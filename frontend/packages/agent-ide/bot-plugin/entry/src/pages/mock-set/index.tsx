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

/* eslint-disable max-lines-per-function */
import React, { type FC, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { UIBreadcrumb } from '@coze-studio/components';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { useSpace } from '@coze-arch/foundation-sdk';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import {
  UIIconButton,
  type UITableMethods,
  UILayout,
  UIButton,
  UITable,
  UIEmpty,
  Space,
  Tooltip,
  Typography,
} from '@coze-arch/bot-semi';
import {
  type PluginAPIInfo,
  SpaceType,
} from '@coze-arch/bot-api/developer_api';
import {
  ComponentType,
  type MockSet,
  TrafficScene,
  OrderBy,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi, PluginDevelopApi } from '@coze-arch/bot-api';
import { MockSetEditModal } from '@coze-studio/mockset-edit-modal-adapter';
import {
  usePluginNavigate,
  usePluginStore,
} from '@coze-studio/bot-plugin-store';
import { IconDeleteOutline, IconEditOutline } from '@coze-arch/bot-icons';
import { MockSetDeleteModal } from '@coze-agent-ide/bot-plugin-mock-set/mockset-delete-modal';
import { CONNECTOR_ID } from '@coze-agent-ide/bot-plugin-mock-set/mock-set/const';

import { getDisplayCols } from './get-col';

import styles from './index.module.less';

interface ListParams {
  pageNo?: number; // Quantity for front-end computing
  pageSize?: number;
  pageToken?: string;
  order?: {
    desc?: boolean;
  };
}

const PAGE_SIZE = 10;
const PLUGIN_NOT_FOUND_CODE = '600303107';
const TOOL_NOT_FOUND_CODE = '600303108';

const MockSetList: FC<{ toolID: string }> = ({ toolID }) => {
  const resourceNavigate = usePluginNavigate();

  // User information
  const userInfo = userStoreService.useUserInfo();

  // routing information

  const [params, setParams] = useState<ListParams>({
    //request parameters
    pageSize: PAGE_SIZE,
    pageNo: 1,
  });

  const { pluginInfo, initPlugin, pluginID, spaceID, version } = usePluginStore(
    useShallow(store => ({
      pluginInfo: store.pluginInfo,
      initPlugin: store.initPlugin,
      pluginID: store.pluginId,
      spaceID: store.spaceID,
      version: store.version,
    })),
  );

  // Space information
  const space = useSpace(spaceID);
  const isPersonal = space?.space_type === SpaceType.Personal;

  // API Details
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [deleteMockSet, setDeleteMockset] = useState<MockSet | undefined>();

  const pageTokenRef = useRef<string>();

  const tableRef = useRef<UITableMethods>(null);

  const [editDisabled, setEditDisabled] = useState(false);

  // The mock context information required by the backend
  const ctxInfo = {
    bizCtx: {
      trafficScene: TrafficScene.Undefined,
      connectorID: CONNECTOR_ID,
      bizSpaceID: spaceID,
      connectorUID: userInfo?.user_id_str,
    },
    mockSubject: {
      componentType: ComponentType.CozeTool,
      componentID: toolID,
      parentComponentType: ComponentType.CozePlugin,
      parentComponentID: pluginID,
    },
  };

  const columns: ColumnProps<MockSet>[] = [
    ...getDisplayCols(isPersonal),
    {
      title: I18n.t('actions'),
      dataIndex: 'action',
      width: 108,
      render: (_v, record) => {
        const isCreator = userInfo?.user_id_str === record?.creator?.ID;
        return (
          <div
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Space spacing={16}>
              <Tooltip content={I18n.t('Edit')}>
                <UIIconButton
                  disabled={!isCreator || editDisabled}
                  icon={<IconEditOutline />}
                  onClick={() => {
                    handleEdit(record);
                  }}
                  className={
                    !isCreator || editDisabled
                      ? styles['icon-disabled']
                      : styles['icon-default']
                  }
                />
              </Tooltip>

              <Tooltip content={I18n.t('Delete')}>
                <UIIconButton
                  icon={<IconDeleteOutline />}
                  className={classNames(
                    styles['icon-delete'],
                    !isCreator || editDisabled
                      ? styles['icon-disabled']
                      : styles['icon-default'],
                  )}
                  disabled={!isCreator || editDisabled}
                  onClick={() => {
                    setDeleteMockset(record);
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        );
      },
    },
  ];

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (
    record?: MockSet,
    autoGenerateConfig?: { generateMode: number },
  ) => {
    const { id } = record || {};
    if (id) {
      resourceNavigate.mocksetDetail?.(
        toolID,
        String(id),
        {},
        {
          state: {
            spaceId: spaceID,
            pluginId: pluginID,
            pluginName: pluginInfo?.meta_info?.name,
            toolId: toolID,
            toolName: apiInfo?.name,
            mockSetId: String(id),
            mockSetName: record?.name,
            generationMode: autoGenerateConfig?.generateMode,
          },
        },
      );
    }
  };

  // Get current tool information
  const getPluginToolInfo = async () => {
    try {
      const { api_info = [] } = await PluginDevelopApi.GetPluginAPIs({
        plugin_id: pluginID,
        api_ids: [toolID],
        preview_version_ts: version,
      });

      if (api_info.length > 0) {
        const apiInfoTemp = api_info.length > 0 ? api_info[0] : {};
        setApiInfo(apiInfoTemp);
      }
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error, eventName: 'fetch_tool_info_fail' });
      setApiInfo({});
    }
  };

  // mock list
  const { data, loading } = useRequest(
    async () => {
      if (
        !ctxInfo.mockSubject.componentID ||
        !ctxInfo.mockSubject.parentComponentID
      ) {
        return {
          total: 0,
          list: [],
        };
      }

      try {
        const { mockSets, pageToken, count } = await debuggerApi.MGetMockSet({
          bizCtx: ctxInfo.bizCtx,
          mockSubject: ctxInfo.mockSubject,
          pageLimit: params.pageSize,
          pageToken: params.pageToken,
          desc: params.order?.desc ?? true,
          orderBy: OrderBy.UpdateTime,
        });
        pageTokenRef.current = pageToken;

        return {
          total: count,
          list: mockSets || [],
        };
      } catch (error) {
        // @ts-expect-error -- linter-disable-autofix
        const { code } = error || {};
        if (code === PLUGIN_NOT_FOUND_CODE || code === TOOL_NOT_FOUND_CODE) {
          setEditDisabled(true);
        }
        return {
          total: 0,
          list: [],
        };
      }
    },
    {
      refreshDeps: [params],
      onError: error => {
        logger.error({ error, eventName: 'fetch_mockset_list_fail' });
      },
    },
  );

  const refreshPage = () => {
    tableRef.current?.reset();
    setParams(p => ({
      ...p,
      pageSize: PAGE_SIZE,
      pageToken: undefined,
      pageNo: 1,
    }));
  };

  useEffect(() => {
    initPlugin();
    getPluginToolInfo();
  }, []);

  return (
    <>
      <div className={styles.page}>
        <UILayout title={renderHtmlTitle(I18n.t('manage_mockset'))}>
          <UILayout.Header
            className={styles['layout-header']}
            breadcrumb={
              <UIBreadcrumb
                showTooltip={{ width: '300px' }}
                pluginInfo={pluginInfo?.meta_info}
                pluginToolInfo={apiInfo}
                compact={false}
                mockSetInfo={{}}
              />
            }
          />
          <UILayout.Content className={styles['layout-content']}>
            <div className={styles['header-info']}>
              <Typography.Text className={styles['layout-header-title']}>
                {pluginInfo?.meta_info?.name
                  ? I18n.t('mockset_of_toolname', {
                      toolName: pluginInfo?.meta_info?.name,
                    })
                  : I18n.t('mockset')}
              </Typography.Text>
              <Tooltip
                style={{ display: editDisabled ? 'block' : 'none' }}
                content={I18n.t(
                  'unreleased_plugins_tool_cannot_create_mockset',
                )}
              >
                <UIButton
                  onClick={handleCreate}
                  theme="solid"
                  disabled={editDisabled}
                >
                  {I18n.t('create_mockset')}
                </UIButton>
              </Tooltip>
            </div>
            <UITable
              ref={tableRef}
              offsetY={207}
              tableProps={{
                loading,
                dataSource: data?.list || [],
                columns,
                onRow: (record?: PluginAPIInfo) => ({
                  onClick: () => {
                    if (!editDisabled) {
                      handleEdit(record);
                    }
                  }, // Click line
                }),
                onChange: e => {
                  if (e.sorter?.sortOrder) {
                    tableRef.current?.reset();

                    //chronological sorting
                    setParams(p => ({
                      ...p,
                      pageSize: PAGE_SIZE,
                      pageNo: 1,
                      pageToken: undefined,
                      order: {
                        desc: e.sorter?.sortOrder === 'descend',
                      },
                    }));
                  }
                },
              }}
              empty={
                <UIEmpty
                  empty={{
                    title: I18n.t('no_mockset_yet'),
                    description: editDisabled
                      ? undefined
                      : I18n.t('click_button_to_create_mockset'),
                    btnText: editDisabled
                      ? undefined
                      : I18n.t('create_mockset'),
                    btnOnClick: editDisabled ? undefined : handleCreate,
                  }}
                />
              }
              enableLoad
              total={Number(data?.total || 0)}
              onLoad={() => {
                setParams(p => ({
                  ...p,
                  pageToken: pageTokenRef.current,
                  pageNo: (p.pageNo ?? 0) + 1,
                }));
              }}
            />
          </UILayout.Content>
        </UILayout>
      </div>
      {showCreateModal ? (
        <MockSetEditModal
          visible={showCreateModal}
          initialInfo={{
            bizCtx: ctxInfo.bizCtx,
            bindSubjectInfo: ctxInfo.mockSubject,
            name: apiInfo?.name,
          }}
          onSuccess={handleEdit}
          onCancel={() => setShowCreateModal(false)}
        ></MockSetEditModal>
      ) : null}
      {
        // Delete pop-up window
        deleteMockSet ? (
          <MockSetDeleteModal
            visible={!!deleteMockSet}
            mockSetInfo={{
              detail: deleteMockSet,
              ctx: {
                bizCtx: ctxInfo.bizCtx,
                mockSubjectInfo: ctxInfo.mockSubject,
              },
            }}
            onSuccess={() => {
              setDeleteMockset(undefined);
              refreshPage();
            }}
            onCancel={() => setDeleteMockset(undefined)}
          ></MockSetDeleteModal>
        ) : null
      }
    </>
  );
};

export { MockSetList };
