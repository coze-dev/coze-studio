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

/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { debounce, union, find } from 'lodash-es';
import { useInfiniteScroll } from 'ahooks';
import {
  CheckType,
  WorkflowMode,
  type Workflow,
} from '@coze-arch/idl/workflow_api';
import {
  type PublishConnectorInfo,
  ConnectorConfigStatus,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle, IconCozEmpty } from '@coze-arch/coze-design/icons';
import {
  Modal,
  Search,
  Checkbox,
  Divider,
  Spin,
  Tooltip,
  Space,
  EmptyState,
} from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { workflowApi } from '@coze-arch/bot-api';

import { useProjectPublishStore } from '@/store';

export interface DataList {
  list: Workflow[];
  hasMore?: boolean;
  nextCursorId?: string;
  total: number;
  nextPageIndex: number;
}

const debounceTimer = 500;

export const UseMcpConfigModal = ({
  record,
}: {
  record: PublishConnectorInfo;
}) => {
  const [visible, setVisible] = useState(false);
  const [searchVal, setSearchVal] = useState<string>('');
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const { space_id = '', project_id = '' } = useParams<DynamicParams>();

  const {
    connectorPublishConfig,
    setProjectPublishInfo,
    connectorList,
    selectedConnectorIds,
  } = useProjectPublishStore(
    useShallow(state => ({
      connectorPublishConfig: state.connectorPublishConfig,
      setProjectPublishInfo: state.setProjectPublishInfo,
      connectorList: state.connectorList,
      selectedConnectorIds: state.selectedConnectorIds,
    })),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const { loading, data, loadingMore } = useInfiniteScroll<DataList>(
    async d => {
      const res = await workflowApi.GetWorkFlowList({
        space_id,
        project_id,
        flow_mode: WorkflowMode.All,
        checker: [CheckType.MCPPublish],
        size: 15,
        page: d?.nextPageIndex ?? 1,
        name: searchVal,
      });
      return {
        list: res.data?.workflow_list ?? [],
        total: Number(res.data?.total ?? 0),
        nextPageIndex: (d?.nextPageIndex || 1) + 1,
      };
    },
    {
      target: containerRef,
      reloadDeps: [searchVal],
      isNoMore: dataSource =>
        Boolean(
          !dataSource?.total ||
            (dataSource.nextPageIndex - 1) * 15 >= dataSource.total,
        ),
    },
  );

  // Only undisabled workflows can be selected.
  const filterPassList = data?.list?.filter(
    item =>
      find(item?.check_result, {
        type: CheckType.MCPPublish,
      })?.is_pass,
  );
  //Half selection state
  const indeterminate =
    checkedList.length > 0 &&
    checkedList.length < (filterPassList?.length || 0);
  //Select All
  const checkAll = checkedList.length === (filterPassList?.length || 0);

  const close = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    setProjectPublishInfo({
      connectorPublishConfig: {
        ...connectorPublishConfig,
        [record.id]: {
          selected_workflows: checkedList.map(item => {
            const res = find(data?.list, {
              workflow_id: item,
            });
            return {
              workflow_id: res?.workflow_id,
              workflow_name: res?.name,
            };
          }),
        },
      },
      connectorList: connectorList.map(item => {
        if (item.id === record.id) {
          return {
            ...item,
            config_status: ConnectorConfigStatus.Configured,
          };
        }
        return item;
      }),
      selectedConnectorIds: union(selectedConnectorIds, [record.id]), //ID merge deduplicate
    });
    close();
  };

  return {
    open: () => {
      setVisible(true);
      const ids = connectorPublishConfig?.[record.id]?.selected_workflows;
      setCheckedList(ids?.map(item => item.workflow_id ?? '') ?? []);
    },
    close,
    node: (
      <Modal
        title={I18n.t('app_publish_connector_space_mcp_config_dialog_title')}
        size="large"
        visible={visible}
        onCancel={close}
        okButtonProps={{ loading, disabled: !checkedList.length }}
        okText={I18n.t('app_publish_connector_space_mcp_config_dialog_confirm')}
        cancelText={I18n.t(
          'app_publish_connector_space_mcp_config_dialog_cancel',
        )}
        onOk={handleConfirm}
      >
        <div className="text-[12px]">
          {I18n.t('app_publish_connector_space_mcp_config_dialog_desc')}
        </div>
        <Space className="mb-[16px]" spacing={4}>
          <div className="text-[12px]">
            {I18n.t('app_publish_connector_space_mcp_config_dialog_desc2')}
          </div>

          <Tooltip
            position="top"
            content={
              <div className="whitespace-pre-line">
                {I18n.t(
                  'app_publish_connector_space_mcp_config_dialog_hover_wf_constraints',
                )}
              </div>
            }
          >
            <IconCozInfoCircle className="text-[14px]" />
          </Tooltip>
        </Space>
        <div className="font-[500] mb-[12px]">
          {I18n.t('app_publish_connector_space_mcp_config_dialog_choose_wf')}
          <span className="coz-fg-hglt-red">*</span>
        </div>
        <div className="border border-solid coz-stroke-primary rounded py-[12px]">
          <div className="mx-[12px]">
            <Search
              className="!w-full"
              placeholder={I18n.t(
                'app_publish_connector_space_mcp_config_dialog_search_placeholder',
              )}
              value={searchVal}
              onSearch={debounce(v => {
                setSearchVal(v);
              }, debounceTimer)}
            />
          </div>

          <Divider className="my-[8px]" />

          <div className="mx-[12px]">
            {data?.list.length ? (
              <Checkbox
                className="my-[8px] px-[4px]"
                indeterminate={indeterminate}
                checked={checkAll}
                onChange={e => {
                  setCheckedList(
                    e.target.checked
                      ? filterPassList?.map(item => item.workflow_id || '') ||
                          []
                      : [],
                  );
                }}
              >
                {I18n.t(
                  'app_publish_connector_space_mcp_config_dialog_filter_all',
                )}
              </Checkbox>
            ) : null}
            <div
              ref={containerRef}
              className="max-h-[300px] overflow-x-hidden overflow-y-auto"
            >
              <Checkbox.Group
                className="gap-[4px]"
                value={checkedList}
                onChange={setCheckedList}
              >
                {data?.list?.map(option => {
                  const mcpOpt = find(option?.check_result, {
                    type: CheckType.MCPPublish,
                  });
                  return (
                    <Checkbox
                      className="p-[4px]"
                      key={option.workflow_id}
                      value={option.workflow_id}
                      disabled={!mcpOpt?.is_pass}
                    >
                      {mcpOpt?.is_pass ? (
                        option.name
                      ) : (
                        <Tooltip position="top" content={mcpOpt?.reason}>
                          {option.name}
                        </Tooltip>
                      )}
                    </Checkbox>
                  );
                })}
              </Checkbox.Group>

              {/* Loading */}
              {loadingMore && data?.list.length ? (
                <div className="text-center">
                  <Spin size="small" />
                </div>
              ) : null}

              {/* empty state */}
              {!data?.list.length ? (
                <EmptyState
                  className="my-[80px] mx-auto"
                  icon={<IconCozEmpty />}
                  title={I18n.t(
                    'app_publish_connector_space_mcp_config_dialog_no_results_found',
                  )}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Modal>
    ),
  };
};
