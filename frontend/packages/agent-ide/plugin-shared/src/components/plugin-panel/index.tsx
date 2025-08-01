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

/* eslint-disable max-lines-per-function, complexity -- onApiToggle of PluginItem can be extracted and optimized later */
/* eslint-disable import/order */
import {
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import classNames from 'classnames';
import { useInViewport } from 'ahooks';
import groupBy from 'lodash-es/groupBy';

import {
  Collapse,
  Divider,
  Highlight,
  Image,
  Space,
  Toast,
  Typography,
  UIButton,
} from '@coze-arch/bot-semi';
import { IconViewinchatOutlined } from '@coze-arch/bot-icons';
import { ConnectorList, OfficialLabel } from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';
import {
  emitEvent,
  OpenBlockEvent,
  formatDate,
  formatNumber,
} from '@coze-arch/bot-utils';

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';

import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { OpenModeType } from '@coze-arch/bot-hooks';
import {
  From,
  type PluginModalModeProps,
} from '../../types/plugin-modal-types';
import { getPluginApiKey } from '../../utils';
import {
  type PluginApi,
  type PluginInfoForPlayground,
  PluginType,
} from '@coze-arch/bot-api/plugin_develop';
import { type Int64 } from '@coze-arch/bot-api/developer_api';

import s from './index.module.less';
import { type SimplifyProductInfo } from '../../service/fetch-plugin';
import { PluginItem } from './item';
import { extractApiParams } from './helper';
import { AvatarName } from '@coze-studio/components';

import { PluginPerfStatics } from './plugin-perf-statics';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import {
  IconCozDesktop,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';

import { isBoolean, isUndefined } from 'lodash-es';
import {
  type CommercialSetting,
  PluginType as ProductPluginType,
} from '@coze-arch/bot-api/product_api';
import { PluginAuthMode } from '../../types/auth-mode';
export interface PluginPanelProps extends PluginModalModeProps {
  info: PluginInfoForPlayground & {
    listed_at?: Int64;
    version_name?: string;
    version_ts?: string;
  };
  highlightWords?: string[];
  showButton?: boolean;
  showCreator?: boolean;
  showCreateTime?: boolean;
  showMarketLink?: boolean;
  showProjectPluginLink?: boolean;
  showPublishTime?: boolean;
  className?: string;
  pluginApiList: PluginApi[];
  onPluginApiListChange: (list: PluginApi[]) => void;
  productInfo?: SimplifyProductInfo;
  commercialSetting?: CommercialSetting;
  isFromMarket?: boolean;
  type?: string;
  scrollContainerRef?: MutableRefObject<HTMLDivElement | null>;
  activeKey?: string | string[] | undefined;
  agentId?: string;
  workflowNodes?: WorkflowNodeJSON[];
  index?: number;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
}

const CopyPlugin = ({ onApiToggle }: { onApiToggle: () => void }) => (
  <UIButton
    onClick={e => {
      e.stopPropagation();
      onApiToggle?.();
    }}
  >
    {I18n.t('add_resource_modal_copy_to_project')}
  </UIButton>
);

export const PluginPanel: React.FC<PluginPanelProps> = ({
  info,
  highlightWords,
  showCreator = false,
  showCreateTime = true,
  showPublishTime = false,
  showButton = true,
  showCopyPlugin = false,
  className = '',
  pluginApiList,
  productInfo,
  showMarketLink,
  showProjectPluginLink,
  clickProjectPluginCallback,
  isFromMarket,
  onPluginApiListChange,
  openMode,
  from,
  workflowNodes,
  openModeCallback,
  onCopyPluginCallback,
  scrollContainerRef,
  type,
  activeKey,
  agentId,
  index = 0,
  addonBefore,
  addonAfter,
}) => {
  const {
    name,
    plugin_apis,
    id,
    plugin_icon,
    project_id,
    desc_for_human,
    create_time = 0,
    update_time = 0,
    statistic_data,
    listed_at,
    plugin_product_status,
    plugin_type,
    is_official,
    version_name,
    version_ts,
  } = info;
  const botId = useBotInfoStore(state => state.botId);
  const { id: productId, status: marketStatus, auth_mode } = productInfo || {};
  const refTarget = useRef(null);
  const refHasReport = useRef(false);

  // Record the apiId of the currently clicked plugin
  const currentApiId = useRef('');

  // Record whether the latest plug-in data of the store is currently being pulled
  const [isFetching, setIsFetching] = useState(false);

  // For example {'pluginID_apiID': [node1, node2, node3,...]}
  const pluginApiNodesMap = useMemo(
    () =>
      groupBy(workflowNodes || [], item => {
        const apiParams = item.data?.inputs?.apiParam ?? [];
        const pluginID = extractApiParams('pluginID', apiParams);
        const apiID = extractApiParams('apiID', apiParams);
        return `${pluginID}_${apiID}`;
      }),
    [workflowNodes],
  );

  const [isInView] = useInViewport(refTarget, {
    root: () => scrollContainerRef?.current,
  });
  const isCheckNow = useMemo(() => {
    if (!id) {
      return false;
    }
    if (activeKey === id || activeKey?.includes(id)) {
      return true;
    }
    return false;
  }, [activeKey, id]);
  useEffect(() => {
    if (isCheckNow) {
      sendTeaEvent(EVENT_NAMES.product_click_front, {
        plugin_id: info.id,
        product_id: `${productInfo?.id}`,
        product_name: info?.name || '',
        entity_type: 'plugin',
        source: 'add_plugin_menu',
        from: 'add_plugin_menu',
        filter_tag: type || '',
        action: 'expand_tools',
        c_position: index,
      });
    }
  }, [isCheckNow, productInfo?.id]);
  useEffect(() => {
    if (!isFromMarket || refHasReport.current) {
      return;
    }
    if (isInView) {
      refHasReport.current = true;
      sendTeaEvent(EVENT_NAMES.product_show_front, {
        plugin_id: info.id,
        product_id: `${productInfo?.id}`,
        product_name: info?.name || '',
        entity_type: 'plugin',
        source: 'add_plugin_menu',
        from: 'add_plugin_menu',
        filter_tag: type || '',
        c_position: index,
      });
    }
  }, [isInView, productInfo, info, type]);

  const timePrefixText = showPublishTime
    ? I18n.t('mkl_plugin_publish')
    : showCreateTime
    ? I18n.t('mkl_plugin_created')
    : I18n.t('mkl_plugin_updated');
  const timeToShow =
    (showPublishTime
      ? Number(listed_at)
      : showCreateTime
      ? Number(create_time)
      : Number(update_time)) || 0;

  const renderAuthStatus = () => {
    if (isUndefined(auth_mode) || auth_mode === PluginAuthMode.NoAuth) {
      return null;
    }
    if (
      auth_mode === PluginAuthMode.Required ||
      auth_mode === PluginAuthMode.Supported
    ) {
      return (
        <Tag color="yellow" className="font-medium !py-2px !px-4px !h-20px">
          {I18n.t('plugin_tool_config_status_unauthorized')}
        </Tag>
      );
    }
    return (
      <Tag color="brand" className="font-medium !py-2px !px-4px !h-20px">
        {I18n.t('plugin_tool_config_status_authorized')}
      </Tag>
    );
  };

  return (
    <Collapse.Panel
      data-testid="plugin-collapse-panel"
      className={classNames(s['plugin-panel'], className)}
      disabled={!plugin_apis?.length}
      header={
        <div className={s['plugin-panel-header']} ref={refTarget}>
          <OfficialLabel
            size="small"
            visible={productInfo?.is_official ?? false}
          >
            <Image
              className={s['header-icon']}
              src={plugin_icon}
              preview={false}
            />
          </OfficialLabel>

          <div className={s['header-main']}>
            <div className={s['header-name']}>
              <Space spacing={8} className="flex-1">
                {/* Plugin name up to 30 characters, no ellipsis required */}
                <Typography.Text>
                  <Highlight
                    sourceString={name}
                    searchWords={highlightWords}
                    component="strong"
                  />
                </Typography.Text>
                {renderAuthStatus()}
                {showProjectPluginLink && clickProjectPluginCallback ? (
                  <IconViewinchatOutlined
                    className={s['market-link-icon']}
                    onClick={event => {
                      event.stopPropagation();
                      clickProjectPluginCallback?.({
                        ...info,
                      });
                    }}
                  />
                ) : null}
                {showMarketLink && Number(productId) > 0 ? (
                  <IconViewinchatOutlined
                    className={s['market-link-icon']}
                    onClick={event => {
                      event.stopPropagation();
                      sendTeaEvent(EVENT_NAMES.product_click_front, {
                        plugin_id: info.id,
                        product_id: `${productInfo?.id}`,
                        product_name: info?.name || '',
                        entity_type: 'plugin',
                        source: 'add_plugin_menu',
                        from: 'add_plugin_menu',
                        filter_tag: type || '',
                        action: 'enter_detailpage',
                        c_position: index,
                      });
                      window.open(
                        `/store/plugin/${productId}?from=add_plugin_menu`,
                      );
                    }}
                  />
                ) : null}
              </Space>
            </div>
            <div className={classNames(s['header-desc'], 'flex items-center')}>
              {plugin_type === PluginType.LOCAL ? (
                <>
                  <Tag color="cyan" size="mini">
                    {I18n.t('local_plugin_label')}
                  </Tag>
                  <Divider layout="vertical" margin="4px" className="h-[9px]" />
                </>
              ) : null}
              <Typography.Text
                ellipsis={{
                  showTooltip: {
                    opts: {
                      content: desc_for_human,
                      style: { wordWrap: 'break-word', maxWidth: '560px' },
                    },
                  },
                  rows: 1,
                }}
              >
                {desc_for_human}
              </Typography.Text>
            </div>

            <div className="my-[8px] leading-[16px]">
              <Space spacing={4}>
                {/* condition */}

                {addonBefore}
                {productInfo?.plugin_type === ProductPluginType.LocalPlugin ? (
                  <Tag
                    color="cyan"
                    prefixIcon={
                      <IconCozDesktop className="coz-fg-color-cyan text-[10px]" />
                    }
                    size="mini"
                  >
                    {I18n.t('store_service_plugin')}
                  </Tag>
                ) : null}
                <Tag color="primary" size="mini">
                  {I18n.t('bot_edit_page_plugin_list_plugin_has_n_tools', {
                    n: plugin_apis?.length,
                  })}
                </Tag>
                {!!statistic_data?.bot_quote && (
                  <Tag color="primary" size="mini">
                    {I18n.t('bot_edit_page_plugin_list_plugin_n_bots_using', {
                      n: formatNumber(statistic_data?.bot_quote),
                    })}
                  </Tag>
                )}
                {productInfo?.connectors?.length ? (
                  <>
                    <Divider
                      layout="vertical"
                      margin={0}
                      className="coz-stroke-primary"
                    />
                    <div className="ml-auto coz-fg-secondary text-base flex items-center gap-6px">
                      {I18n.t('store_service_plugin_connector')}
                      <ConnectorList connectors={productInfo?.connectors} />
                      <Tooltip
                        content={I18n.t('store_add_connector_tootip')}
                        theme="dark"
                      >
                        <IconCozInfoCircle className="coz-fg-secondary text-lg" />
                      </Tooltip>
                    </div>
                  </>
                ) : null}
              </Space>
            </div>

            <div className={'flex justify-between'}>
              <Space className={s['header-info']}>
                {showCreator ? (
                  <span className={'max-w-[260px]'}>
                    <AvatarName
                      avatar={productInfo?.user_info?.avatar_url}
                      username={productInfo?.user_info?.user_name}
                      name={productInfo?.user_info?.name}
                      label={{
                        name: productInfo?.user_info?.user_label?.label_name,
                        icon: productInfo?.user_info?.user_label?.icon_url,
                        href: productInfo?.user_info?.user_label?.jump_link,
                      }}
                      nameMaxWidth={150}
                    />
                  </span>
                ) : null}
                {showCreator ? <Divider layout="vertical" /> : null}
                <div className={s['creator-time']}>
                  {`${timePrefixText} `}
                  {formatDate(timeToShow, 'YYYY-MM-DD HH:mm')}
                </div>
                {addonAfter}
              </Space>
              <PluginPerfStatics
                className={s['plugin-total']}
                successRate={productInfo?.success_rate}
                callAmount={productInfo?.call_amount}
                avgExecTime={productInfo?.avg_exec_time}
                botsUseCount={productInfo?.bots_use_count}
              />
            </div>
          </div>
          {showCopyPlugin ? (
            <div>
              <CopyPlugin
                onApiToggle={() => {
                  onCopyPluginCallback?.({
                    pluginID: id,
                    name,
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      }
      itemKey={`${id}`}
    >
      {plugin_apis?.map(api => {
        const isAdded = pluginApiList.some(
          addedApi =>
            (addedApi.api_id && addedApi.api_id === api.api_id) ||
            (addedApi.plugin_id?.toString() ?? '0') + (addedApi.name ?? '') ===
              (api.plugin_id?.toString() ?? '0') + (api.name ?? ''),
        );
        return (
          <PluginItem
            data-testid="plugin-panel-item-pluginapi"
            isAdded={isAdded}
            pluginApi={api}
            from={from}
            workflowNodes={
              pluginApiNodesMap[`${api?.plugin_id}_${api?.api_id}`] ?? []
            }
            marketPluginInfo={
              isFromMarket
                ? productInfo?.tools?.find(item => item.id === api.api_id)
                : undefined
            }
            isLocalPlugin={
              productInfo?.plugin_type === ProductPluginType.LocalPlugin
            }
            connectors={productInfo?.connectors?.map(item => item.name ?? '')}
            marketStatus={isFromMarket ? marketStatus : undefined}
            onApiToggle={async () => {
              let isSuccess = true;
              emitEvent(OpenBlockEvent.PLUGIN_API_BLOCK_OPEN);
              if (isAdded) {
                onPluginApiListChange(
                  pluginApiList.filter(
                    item =>
                      getPluginApiKey(item) !== getPluginApiKey(api) &&
                      (!item?.api_id || item?.api_id !== api?.api_id),
                  ),
                );
                Toast.success({
                  content: I18n.t('bot_edit_tool_removed_toast', {
                    api_name: api.name,
                  }),
                  showClose: false,
                });
                sendTeaEvent(EVENT_NAMES.click_tool_select, {
                  operation: 'remove',
                  bot_id: botId,
                  operation_type: 'single',
                  tool_id: api?.api_id || '',
                  tool_name: api?.name || '',
                  product_id: `${productInfo?.id}`,
                  product_name: info?.name || '',
                  source: 'add_plugin_list',
                  from: 'bot_develop',
                });
              } else {
                let apiToSend: PluginApi | undefined;
                // The information of the plugin where the api is located is added and stored in the store to avoid GetPlaygroundPluginList multiple requests
                const pluginInfo = {
                  plugin_icon,
                  plugin_type,
                  is_official,
                  project_id,
                  version_name,
                  version_ts,
                };
                // Check whether the name of the Plugins currently to be added has a duplicate name in the added list (the model does not support it, so this is added)
                if (
                  pluginApiList
                    .map(i => (i.plugin_name ?? '') + i.name)
                    .includes((api.plugin_name ?? '') + (api.name ?? ''))
                ) {
                  Toast.error({
                    content: I18n.t('plugin_name_conflict_error'),
                    showClose: false,
                  });
                  isSuccess = false;
                } else {
                  if (isFromMarket) {
                    if (api.plugin_id && api?.api_id && api?.api_id !== '0') {
                      setIsFetching(true);
                      currentApiId.current = api.api_id;

                      // Data from the market needs to be re-pulled to the latest data.
                      const result =
                        await PluginDevelopApi.GetPlaygroundPluginList({
                          page: 1,
                          size: 1,
                          plugin_ids: [api.plugin_id],
                          plugin_types: [
                            PluginType.PLUGIN,
                            PluginType.APP,
                            PluginType.LOCAL,
                          ],
                          space_id: useSpaceStore.getState().getSpaceId(),
                        });

                      setIsFetching(false);
                      const targetApi =
                        result?.data?.plugin_list?.[0]?.plugin_apis?.find(
                          item => item?.api_id === api?.api_id,
                        );
                      if (targetApi) {
                        Object.assign(targetApi, {
                          plugin_product_status:
                            result?.data?.plugin_list?.[0]
                              .plugin_product_status,
                          ...pluginInfo,
                        });
                      }
                      apiToSend = targetApi;
                    }
                  } else {
                    apiToSend = Object.assign(
                      { ...api },
                      { plugin_product_status, ...pluginInfo },
                    );
                  }
                  if (apiToSend) {
                    // If it can only be added once, call callback after adding and close the pop-up window
                    if (
                      openMode === OpenModeType.OnlyOnceAdd ||
                      (from &&
                        [
                          From.WorkflowAddNode,
                          From.ProjectIde,
                          From.ProjectWorkflow,
                        ].includes(from))
                    ) {
                      const cbResult = await openModeCallback?.({
                        ...apiToSend,
                        ...pluginInfo,
                      });
                      /** Allow to add failed scenarios  */
                      if (isBoolean(cbResult)) {
                        return cbResult;
                      }
                      return isSuccess;
                    }
                    if (!IS_OPEN_SOURCE) {
                      // After successfully adding the plugin, quickly bind the preset card information
                      await PluginDevelopApi.QuickBindPluginPresetCard({
                        plugin_id: apiToSend.plugin_id,
                        api_name: apiToSend.name,
                        bot_id: botId,
                        agent_id: agentId,
                        space_id: useSpaceStore.getState().getSpaceId(),
                      });
                    }
                    onPluginApiListChange([...pluginApiList, apiToSend]);
                    Toast.success({
                      content: I18n.t('bot_edit_tool_added_toast', {
                        api_name: api.name,
                      }),
                      showClose: false,
                    });
                  } else {
                    Toast.error({
                      content: withSlardarIdButton(
                        I18n.t('bot_edit_tool_added_toast_error', {
                          api_name: api.name,
                        }),
                      ),
                      showClose: false,
                    });
                    isSuccess = false;
                  }
                }

                sendTeaEvent(EVENT_NAMES.click_tool_select, {
                  operation: 'add',
                  bot_id: botId,
                  operation_type: 'single',
                  tool_id: api?.api_id || '',
                  tool_name: api?.name || '',
                  product_id: `${productInfo?.id}`,
                  product_name: info?.name || '',
                  source: 'add_plugin_list',
                  from: 'bot_develop',
                });
              }

              return isSuccess;
            }}
            key={(api.plugin_id?.toString() ?? '') + (api.name ?? '')}
            showButton={showButton}
            loading={isFetching && api?.api_id === currentApiId.current}
          />
        );
      })}
    </Collapse.Panel>
  );
};
