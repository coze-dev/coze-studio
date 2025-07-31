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

/* eslint-disable max-lines */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function -- columns */
import { type ReactNode, type MouseEvent } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { formatDate, formatNumber } from '@coze-arch/bot-utils';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import {
  UIIconButton,
  UITag,
  Typography,
  Tooltip,
  Dropdown,
  Space,
  Popconfirm,
  Switch,
  OverflowList,
} from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type PluginAPIInfo,
  APIDebugStatus,
  ProductStatus,
  CreationMethod,
  type GetUpdatedAPIsResponse,
  DebugExampleStatus,
  PluginType,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import {
  InitialAction,
  PLUGIN_API_TYPE_MAP,
  PLUGIN_SERVICE_MAP,
  type PluginInfoProps,
} from '@coze-studio/plugin-shared';
import {
  usePluginNavigate,
  usePluginStore,
} from '@coze-studio/bot-plugin-store';
import {
  IconPlayRoundOutlined,
  IconEditKnowledge,
  IconMore,
  IconExampleInvalid,
  IconExampleNone,
  IconExampleNormal,
} from '@coze-arch/bot-icons';

import s from './index.module.less';

const { Text, Paragraph } = Typography;

const stopPro = (e: MouseEvent<HTMLDivElement>) => {
  e.stopPropagation(); //Stop bubbling
};

const exampleStatusConfig = {
  [DebugExampleStatus.Disable]: <IconExampleInvalid />,
  [DebugExampleStatus.Enable]: <IconExampleNormal />,
  [DebugExampleStatus.Default]: <IconExampleNone />,
};

type SetShowDropdownItem = (info?: PluginAPIInfo) => void;

export interface UseGetToolColumnsProps {
  targetSwitchId: string;
  setTargetSwitchId: (id: string) => void;
  loading: boolean;
  canEdit: boolean;
  refreshPage: () => void;
  plugin_id?: string;
  pluginInfo?: PluginInfoProps;
  updatedInfo?: GetUpdatedAPIsResponse;
  showDropdownItem?: PluginAPIInfo;
  setShowDropDownItem: SetShowDropdownItem;
  handleIdeJump: (initialAction?: InitialAction, id?: string) => void;
  setCurAPIInfo: (info: PluginAPIInfo) => void;
  openExample: (info: PluginAPIInfo) => void;
  projectId?: string;
  customRender?: (props: {
    pluginInfo: PluginInfoProps | undefined;
    pluginApiInfo: PluginAPIInfo;
    canEdit: boolean;
    setShowDropDownItem: SetShowDropdownItem;
  }) => ReactNode;
}

export const useGetToolColumns = (props: UseGetToolColumnsProps) => {
  const resourceNavigate = usePluginNavigate();

  const { checkPluginIsLockedByOthers, wrapWithCheckLock } = usePluginStore(
    useShallow(store => ({
      checkPluginIsLockedByOthers: store.checkPluginIsLockedByOthers,
      wrapWithCheckLock: store.wrapWithCheckLock,
    })),
  );

  const [FLAGS2] = useFlags();

  const {
    targetSwitchId,
    setTargetSwitchId,
    loading,
    canEdit,
    refreshPage,
    plugin_id,
    pluginInfo,
    updatedInfo,
    handleIdeJump,
    showDropdownItem,
    setShowDropDownItem,
    setCurAPIInfo,
    openExample,
    projectId,
    customRender,
  } = props ?? {};

  /** Whether to open api */
  const openApi = async ({
    apiId,
    disabled,
  }: {
    apiId: string;
    disabled: boolean;
  }) => {
    const res = await PluginDevelopApi.UpdateAPI({
      plugin_id: plugin_id || '',
      api_id: apiId,
      edit_version: pluginInfo?.edit_version,
      disabled,
    });
    if (res) {
      refreshPage();
    }
  };

  const getColumns = (): ColumnProps<PluginAPIInfo>[] => [
    {
      title: I18n.t('plugin_api_list_table_toolname'),
      dataIndex: 'name',
      // width: 300,
      className: s['min-width-200'],
      render: (_v, record) => (
        <div>
          <Paragraph
            strong
            ellipsis={{
              showTooltip: {
                opts: { style: { wordBreak: 'break-word' } },
              },
            }}
          >
            {record.name}
          </Paragraph>
          <Paragraph
            className={s['tool-table-desc']}
            ellipsis={{
              showTooltip: {
                opts: {
                  style: { wordBreak: 'break-word', maxWidth: '560px' },
                  stopPropagation: true,
                },
              },
            }}
          >
            {record.desc}
          </Paragraph>
        </div>
      ),
    },
    {
      title: I18n.t('plugin_api_list_table_Parameter'),
      dataIndex: 'request_params',
      width: 200,
      render: (_v, record) => {
        if (!record.request_params || record.request_params?.length === 0) {
          return '-';
        }
        const tagList = record.request_params?.map(item => ({
          tagName: item.name,
          key: item.id,
        }));
        const tagListText = record.request_params?.map(item => item.name);

        interface OverflowTagItem {
          tagName?: string;
          key?: string;
        }

        const renderOverflow = (items: OverflowTagItem[]) =>
          items.length ? (
            <Tooltip
              style={{ wordBreak: 'break-word' }}
              content={tagListText?.join('、')}
            >
              <UITag
                color="grey"
                size="small"
                style={{
                  /** Make sure there are no extreme flashing cases */
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                +{items.length}
              </UITag>
            </Tooltip>
          ) : null;

        const renderItem = (item: OverflowTagItem) => (
          <UITag
            color="grey"
            size="small"
            style={{
              marginRight: '8px',
              width: 'fit-content',
              minWidth: 'fit-content',
            }}
            key={item.key}
          >
            {item.tagName}
          </UITag>
        );
        return (
          <OverflowList
            items={tagList}
            overflowRenderer={renderOverflow}
            visibleItemRenderer={renderItem}
            collapseFrom="end"
          />
        );
      },
    },
    {
      title: I18n.t('plugin_service_status'),
      dataIndex: 'online_status',
      width: 130,
      render: (_v, record) => {
        if (
          !('online_status' in record) ||
          record.online_status === undefined
        ) {
          return '-';
        }
        const serviceConfig = PLUGIN_SERVICE_MAP.get(record.online_status);
        return (
          <Space spacing={4}>
            <span
              className={s['circle-point']}
              style={{ background: serviceConfig?.color }}
            />

            {serviceConfig?.label}
          </Space>
        );
      },
    },
    {
      title: I18n.t('plugin_api_list_table_status'),
      dataIndex: 'plugin_type',
      width: 130,
      render: (_v, record) => {
        if (!('debug_status' in record)) {
          return '-';
        }

        const typeConfig = PLUGIN_API_TYPE_MAP.get(
          record.debug_status || APIDebugStatus.DebugWaiting,
        );
        return <UITag color={typeConfig?.color}>{typeConfig?.label}</UITag>;
      },
    },
    {
      title: I18n.t('plugin_api_list_table_botUsing'),
      dataIndex: 'statistic_data',
      width: 100,
      render: (_v, record) => {
        if (!record.statistic_data?.bot_quote) {
          return '-';
        }
        return (
          <Text
            style={{ color: 'rgba(28, 29, 35, 0.60)' }}
            ellipsis={{ showTooltip: true }}
          >
            {formatNumber(record.statistic_data.bot_quote)}
          </Text>
        );
      },
    },
    {
      title: I18n.t('plugin_api_list_table_Create_time'),
      dataIndex: 'create_time',
      width: 150,
      sorter: true,
      render: (_v, record) => {
        if (!record.create_time) {
          return '-';
        }
        return (
          <div>
            {formatDate(Number(record.create_time), 'YYYY-MM-DD HH:mm')}
          </div>
        );
      },
    },
    {
      title: I18n.t('dataset_detail_tableTitle_enable'),
      dataIndex: 'disabled',
      width: 80,
      render: (_v, record) => (
        <div
          style={{ display: 'flex' }}
          onClick={e => {
            stopPro(e);
          }}
        >
          <Switch
            loading={targetSwitchId === record.api_id && loading}
            disabled={!canEdit}
            checked={!record?.disabled}
            onChange={async (v, e) => {
              setShowDropDownItem(undefined);
              e.stopPropagation();

              const locked = await checkPluginIsLockedByOthers();

              if (locked) {
                return;
              }

              setTargetSwitchId(record.api_id || '');
              openApi({ apiId: record.api_id || '', disabled: !v });
            }}
          />
        </div>
      ),
    },
    {
      title: I18n.t('plugin_api_list_table_action'),
      dataIndex: 'action',
      width: 215,
      // eslint-disable-next-line complexity
      render: (_v, record) => {
        const mocksetDisabled =
          record?.response_params?.length === 0 ||
          !pluginInfo?.published ||
          (pluginInfo?.status &&
            updatedInfo?.created_api_names &&
            Boolean(
              updatedInfo.created_api_names.includes(record?.name || ''),
            ));
        return (
          <div
            onClick={e => {
              stopPro(e);
            }}
          >
            <Space spacing={16}>
              <Tooltip content={I18n.t('Edit')}>
                <UIIconButton
                  type="secondary"
                  disabled={!canEdit}
                  icon={<IconEditKnowledge />}
                  className={classNames(!canEdit && s['icon-btn-disable'])}
                  onClick={wrapWithCheckLock(() => {
                    setShowDropDownItem(undefined);
                    handleIdeJump(InitialAction.SELECT_TOOL, record.api_id);
                  })}
                />
              </Tooltip>
              {customRender?.({
                pluginInfo,
                pluginApiInfo: record,
                canEdit,
                setShowDropDownItem,
              })}
              {pluginInfo?.creation_method !== CreationMethod.IDE && (
                <Tooltip
                  content={I18n.t('plugin_api_list_table_debugicon_tooltip')}
                >
                  <UIIconButton
                    type="secondary"
                    disabled={!canEdit}
                    icon={<IconPlayRoundOutlined />}
                    className={classNames(!canEdit && s['debug-btn-disable'])}
                    onClick={wrapWithCheckLock(() => {
                      setShowDropDownItem(undefined);
                      if (record?.api_id) {
                        resourceNavigate.tool?.(record.api_id, { toStep: '3' });
                      }
                    })}
                  />
                </Tooltip>
              )}
              {/* example */}
              {'debug_example_status' in record ? (
                <Tooltip
                  content={I18n.t('plugin_edit_tool_test_run_example_tip')}
                >
                  <UIIconButton
                    type="secondary"
                    disabled={!canEdit}
                    icon={
                      // @ts-expect-error -- linter-disable-autofix
                      exampleStatusConfig[record?.debug_example_status ?? '']
                    }
                    className={classNames(
                      !canEdit && s['icon-example-disabled'],
                    )}
                    onClick={wrapWithCheckLock(() => {
                      setShowDropDownItem(undefined);
                      if (record?.api_id) {
                        openExample(record);
                      }
                    })}
                  />
                </Tooltip>
              ) : null}
              {/* {pluginInfo.creation_method !== CreationMethod.IDE && ( */}
              <Dropdown
                position="bottomRight"
                zIndex={1010}
                trigger={projectId ? 'hover' : 'custom'}
                visible={record.api_id === showDropdownItem?.api_id}
                render={
                  <Dropdown.Menu className="px-[4px]">
                    {/* Support soon, so stay tuned. */}
                    {FLAGS2['bot.devops.plugin_import_export'] ? (
                      <Dropdown.Item
                        disabled={
                          pluginInfo?.plugin_type === PluginType.LOCAL ||
                          pluginInfo?.creation_method === CreationMethod.IDE
                        }
                        className="rounded-[4px]"
                        onClick={() => {
                          setShowDropDownItem(undefined);
                          setCurAPIInfo(record);
                        }}
                      >
                        {I18n.t('code_snippet')}
                      </Dropdown.Item>
                    ) : null}
                    {/* Support soon, so stay tuned. */}
                    {FLAGS2['bot.devops.plugin_mockset'] ? (
                      <Dropdown.Item
                        className="rounded-[4px]"
                        disabled={mocksetDisabled}
                        onClick={() => {
                          setShowDropDownItem(undefined);
                          if (record?.api_id) {
                            resourceNavigate.mocksetList?.(record.api_id);
                          }
                        }}
                      >
                        <Tooltip
                          position="left"
                          style={{
                            display: mocksetDisabled ? 'block' : 'none',
                          }}
                          content={I18n.t(
                            'cannot_enable_mock_set_due_empty_return',
                          )}
                        >
                          <span>{I18n.t('manage_mockset')}</span>
                        </Tooltip>
                      </Dropdown.Item>
                    ) : null}

                    <Dropdown.Item
                      className="rounded-[4px]"
                      disabled={
                        !canEdit ||
                        pluginInfo?.plugin_product_status ===
                          ProductStatus.Listed ||
                        pluginInfo?.creation_method === CreationMethod.IDE
                      }
                    >
                      <Tooltip
                        position="left"
                        style={{
                          display:
                            pluginInfo?.plugin_product_status ===
                            ProductStatus.Listed
                              ? 'block'
                              : 'none',
                        }}
                        content={I18n.t('mkpl_plugin_disable_delete')}
                      >
                        <Popconfirm
                          style={{ width: 400 }}
                          okType="danger"
                          trigger="click"
                          onVisibleChange={visible => {
                            if (!visible) {
                              setShowDropDownItem(undefined);
                            } else {
                              setShowDropDownItem(record);
                            }
                          }}
                          onConfirm={wrapWithCheckLock(async () => {
                            await PluginDevelopApi.DeleteAPI({
                              plugin_id: record.plugin_id || '',
                              api_id: record.api_id || '',
                              edit_version: pluginInfo?.edit_version,
                            });
                            refreshPage();
                          })}
                          title={I18n.t('project_plugin_delete_modal_title', {
                            pluginName: record.name,
                          })}
                          content={I18n.t(
                            'project_plugin_delete_modal_description',
                          )}
                          okText={I18n.t('Remove')}
                          cancelText={I18n.t('Cancel')}
                          disabled={
                            !canEdit ||
                            pluginInfo?.plugin_product_status ===
                              ProductStatus.Listed ||
                            pluginInfo?.creation_method === CreationMethod.IDE
                          }
                        >
                          {I18n.t('delete_tool')}
                        </Popconfirm>
                      </Tooltip>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                }
              >
                <UIIconButton
                  theme="borderless"
                  className={s['icon-more']}
                  icon={<IconMore />}
                  onClick={() => {
                    if (!showDropdownItem) {
                      setShowDropDownItem(record);
                    } else {
                      if (showDropdownItem?.api_id === record?.api_id) {
                        setShowDropDownItem(undefined);
                      } else {
                        setShowDropDownItem(record);
                      }
                    }
                  }}
                />
              </Dropdown>
              {/* )} */}
            </Space>
          </div>
        );
      },
    },
  ];

  return {
    getColumns,
  };
};
