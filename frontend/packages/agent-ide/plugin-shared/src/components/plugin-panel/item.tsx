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

import { useState } from 'react';

import { sortBy } from 'lodash-es';
import classNames from 'classnames';
import { useBoolean } from 'ahooks';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';
import { ParametersPopover } from '@coze-studio/components/parameters-popover';
import { CardThumbnailPopover } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import {
  Space,
  Tooltip,
  Typography,
  UIButton,
  UITag,
} from '@coze-arch/bot-semi';
import { ProductStatus, type public_api } from '@coze-arch/bot-api/product_api';
import { type PluginApi } from '@coze-arch/bot-api/plugin_develop';
import { useViewExample } from '@coze-agent-ide/bot-plugin-tools/useViewExample';
import { Popconfirm } from '@coze-arch/coze-design';
import { OverflowList } from '@blueprintjs/core';

import { From } from '../../types/plugin-modal-types';
import { PluginPerfStatics } from './plugin-perf-statics';

import s from './index.module.less';

type PluginToolInfo = public_api.PluginToolInfo;

export interface PluginItemProps {
  isAdded?: boolean;
  onApiToggle: () => Promise<boolean>;
  pluginApi: PluginApi;
  showButton?: boolean;
  marketStatus?: ProductStatus;
  from?: From;
  workflowNodes?: WorkflowNodeJSON[];
  loading?: boolean;
  marketPluginInfo?: PluginToolInfo;
  isLocalPlugin?: boolean;
  connectors?: string[];
}

interface OverflowTagItem {
  tagName?: string;
  key?: string;
}

// eslint-disable-next-line complexity
export const PluginItem: React.FC<PluginItemProps> = ({
  isAdded,
  onApiToggle,
  pluginApi,
  marketStatus,
  showButton,
  from,
  workflowNodes,
  loading,
  marketPluginInfo,
  isLocalPlugin,
  connectors,
}) => {
  const { name, desc, parameters, debug_example } = pluginApi;
  const { exampleNode, doShowExample } = useViewExample();
  const [isMouseIn, { setFalse, setTrue }] = useBoolean(false);

  const onMouseEnter = () => {
    setTrue();
  };
  const onMouseLeave = () => {
    setFalse();
  };

  const [count, setCount] = useState((workflowNodes || []).length);
  const isFromWorkflow =
    from === From.WorkflowAddNode || from === From.ProjectWorkflow;

  const renderOverflow = (items: OverflowTagItem[]) =>
    items.length ? (
      <UITag className={s['tag-item']} size="small">
        +{items.length}
      </UITag>
    ) : null;

  const renderItem = (item: OverflowTagItem) => (
    <UITag className={s['tag-item']} size="small" key={item.key}>
      {item.tagName}
    </UITag>
  );
  const isDisabled = marketStatus === ProductStatus?.Unlisted;
  // The end plug-in has not been added, and the applicable channel is prompted.
  const showAddConfirm =
    isLocalPlugin &&
    ((!isFromWorkflow && !isAdded) || (isFromWorkflow && count === 0));
  return (
    <>
      {exampleNode}
      <div className={s['plugin-item']}>
        <div className={s['plugin-api-main']}>
          <Space className={s['plugin-api-name']}>
            <Typography.Text
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: name,
                    style: { wordBreak: 'break-word' },
                  },
                },
              }}
            >
              {name}
            </Typography.Text>
            {/* Preview preview card */}
            {pluginApi?.card_binding_info?.thumbnail ? (
              <CardThumbnailPopover
                url={pluginApi?.card_binding_info?.thumbnail}
              />
            ) : null}
          </Space>
          <div className={s['plugin-api-desc']}>
            <Typography.Text
              style={{ width: 640 }}
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: desc,
                    style: { wordBreak: 'break-word', maxWidth: '560px' },
                  },
                },
                rows: 1,
              }}
            >
              {desc}
            </Typography.Text>
            {!!parameters?.length && (
              <div className={s['api-params']}>
                <OverflowList
                  items={sortBy(
                    parameters,
                    item => item.name?.length,
                  )?.map<OverflowTagItem>((tag, index) => ({
                    tagName: tag.name,
                    key: String(index),
                  }))}
                  overflowRenderer={renderOverflow}
                  visibleItemRenderer={renderItem}
                  collapseFrom="end"
                  className={s['params-tags']}
                />
                <ParametersPopover pluginApi={pluginApi}>
                  <div className={s['params-desc']}>{I18n.t('parameters')}</div>
                </ParametersPopover>
                {debug_example ? (
                  <div
                    className={s['params-desc']}
                    style={{ marginLeft: '8px' }}
                    onClick={() =>
                      doShowExample({
                        scene: 'bot',
                        requestParams: parameters,
                        debugExample: debug_example,
                      })
                    }
                  >
                    {I18n.t('plugin_edit_tool_view_example')}
                  </div>
                ) : null}
              </div>
            )}
            <PluginPerfStatics
              className={s['store-plugin-tools']}
              callAmount={marketPluginInfo?.call_amount}
              avgExecTime={marketPluginInfo?.avg_exec_time}
              successRate={marketPluginInfo?.success_rate}
              botsUseCount={marketPluginInfo?.bots_use_count}
            />
          </div>
        </div>
        <div className={s['plugin-api-method']}>
          {showButton ? (
            <Popconfirm
              key={`${showAddConfirm}`}
              trigger={!isDisabled && showAddConfirm ? 'click' : 'custom'}
              position="bottomRight"
              title={I18n.t('store_service_plugin_connector_only', {
                connector_names: connectors?.join('、'),
              })}
              okText={I18n.t('Add_1')}
              cancelText={I18n.t('Cancel')}
              onConfirm={() => {
                onApiToggle?.().then(isSuccess => {
                  if (isSuccess) {
                    setCount(prev => prev + 1);
                  }
                });
              }}
            >
              <div>
                <Tooltip
                  content={I18n.t('mkpl_plugin_delisted_tips')}
                  trigger={isDisabled ? 'hover' : 'custom'}
                >
                  <UIButton
                    data-testid="bot.ide.plugin.plugin-panel-plugin-item-btn"
                    className={classNames(s['operator-btn'], {
                      [s.added]: !isDisabled && isAdded,
                      [s.addedMouseIn]: !isDisabled && isAdded && isMouseIn,
                    })}
                    onClick={() => {
                      if (showAddConfirm) {
                        return;
                      }
                      onApiToggle?.().then(isSuccess => {
                        if (isSuccess) {
                          setCount(prev => prev + 1);
                        }
                      });
                    }}
                    onMouseEnter={onMouseEnter}
                    disabled={isDisabled}
                    loading={loading && isFromWorkflow}
                    onMouseLeave={onMouseLeave}
                  >
                    {isAdded && !isDisabled ? (
                      isMouseIn ? (
                        I18n.t('Remove')
                      ) : (
                        I18n.t('Added')
                      )
                    ) : (
                      <>
                        <span>{I18n.t('Add_1')}</span>
                        {isFromWorkflow && count !== 0 ? (
                          <span className={s.workflow_count_span}>{count}</span>
                        ) : null}
                      </>
                    )}
                  </UIButton>
                </Tooltip>
              </div>
            </Popconfirm>
          ) : null}
        </div>
        {/* <Switch
        disabled={isReadonly}
        checked={Boolean(
          $enabledPluginApiList.apiList.find(
            api =>
              (api.plugin_id?.toString() ?? '0') + (api.name ?? '') ===
              (plugin_id?.toString() ?? '0') + (name ?? ''),
          ),
        )}
        onChange={checked => {
          if (!checked) {
            const index = $enabledPluginApiList.apiList.findIndex(
              api =>
                (api.plugin_id?.toString() ?? '0') + (api.name ?? '') ===
                (plugin_id?.toString() ?? '0') + (name ?? ''),
            );

            if (index >= 0) {
              $enabledPluginApiList.apiList.splice(index, 1);
            }
            return;
          }
          $enabledPluginApiList.apiList.push(pluginApi);
        }}
      /> */}
      </div>
    </>
  );
};
