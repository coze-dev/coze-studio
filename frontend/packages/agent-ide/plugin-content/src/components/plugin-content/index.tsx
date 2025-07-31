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

import { type ReactNode, type FC, useMemo } from 'react';

import copy from 'copy-to-clipboard';
import { ParametersPopover } from '@coze-studio/components/parameters-popover';
import { type EnabledPluginApi } from '@coze-studio/bot-detail-store/skill-types';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Tag, Toast } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { CustomError } from '@coze-arch/bot-error';
import {
  PluginStatus,
  PluginType,
  type PluginApi,
  type PluginInfoForPlayground,
} from '@coze-arch/bot-api/plugin_develop';
import { ComponentType, TrafficScene } from '@coze-arch/bot-api/debugger_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import {
  ToolItem,
  ToolItemActionCopy,
  ToolItemActionDelete,
  ToolItemIconInfo,
  ToolItemList,
  useToolItemContext,
} from '@coze-agent-ide/tool';
import { getPluginApiKey, getApiUniqueId } from '@coze-agent-ide/plugin-shared';
import { PluginSettingEnter } from '@coze-agent-ide/plugin-setting-adapter';

export interface PluginContentProps {
  spaceID?: string;
  botId: string;
  pluginApis: EnabledPluginApi[];
  plugins: PluginInfoForPlayground[];
  readonly: boolean;
  renderPluginItemIconSlot?: (parameters: RenderSlotParameters) => ReactNode;
  renderActionSlot?: (parameters: RenderSlotParameters) => ReactNode;
}

export type RenderSlotParameters = PluginData & {
  apiUniqueId: string;
};

export interface PluginData {
  api: EnabledPluginApi;
  info: PluginInfoForPlayground | undefined;
}

export const PluginContent: FC<PluginContentProps> = ({
  spaceID,
  botId,
  pluginApis,
  plugins,
  readonly,
  renderPluginItemIconSlot,
  renderActionSlot,
}) => {
  const updateSkillPluginApis = useBotSkillStore(
    state => state.updateSkillPluginApis,
  );

  const pluginData: PluginData[] = useMemo(
    () =>
      pluginApis.map(api => {
        const info = plugins.find(_plugin => _plugin.id === api.plugin_id);
        return {
          api,
          info,
        };
      }),
    [pluginApis, plugins],
  );

  const handleDelete = (
    api: EnabledPluginApi,
    info?: PluginInfoForPlayground,
  ) => {
    updateSkillPluginApis(
      pluginApis.filter(
        // Compatible with historical data, some api_id are '0' and will be deleted together
        a => getPluginApiKey(a) !== getPluginApiKey(api),
      ) as PluginApi[],
    );
    if (api.isAuto) {
      sendTeaEvent(EVENT_NAMES.delete_rec_plugin, {
        bot_id: botId,
        api_name: api.name || '',
        plugin_id: api.plugin_id || '',
      });
    }

    PluginDevelopApi.DeleteBotDefaultParams({
      bot_id: botId,
      dev_id: info?.creator?.id,
      plugin_id: api.plugin_id,
      api_name: api.name,
      space_id: spaceID,
      delete_bot: false,
    });
  };

  return (
    <>
      <ToolItemList>
        {pluginData.map((plugin, index) => {
          const apiUniqueId = getApiUniqueId({
            apiInfo: plugin.api,
          });

          const isBanned = plugin.info?.status === PluginStatus.BANNED;
          const renderSlotParams = { ...plugin, apiUniqueId };
          return (
            <ToolItem
              key={index}
              title={`${plugin.info?.name ?? ''} / ${plugin.api.name}`}
              tags={
                // The end plug-in needs to be tagged.
                plugin.info?.plugin_type === PluginType.LOCAL ? (
                  <Tag color="cyan" size="mini">
                    {I18n.t('local_plugin_label')}
                  </Tag>
                ) : null
              }
              description={plugin.api?.desc ?? ''}
              avatar={plugin.info?.plugin_icon ?? ''}
              disabled={isBanned}
              tooltips={
                isBanned && (
                  <div className="flex flex-row items-center">
                    <span className="coz-fg-primary mr-[8px]">
                      {I18n.t('Plugin_delisted')}
                    </span>
                    {/* Action Delete */}
                    <IconButton
                      icon={<IconCozTrashCan />}
                      onClick={() => handleDelete(plugin.api, plugin.info)}
                      size="small"
                    />
                  </div>
                )
              }
              icons={renderPluginItemIconSlot?.(renderSlotParams)}
              actions={
                !isBanned && (
                  <Actions
                    botId={botId}
                    spaceID={spaceID}
                    pluginApis={pluginApis}
                    plugin={plugin}
                    readonly={readonly}
                    isBanned={isBanned}
                    handleDelete={handleDelete}
                    slot={renderActionSlot?.(renderSlotParams)}
                  />
                )
              }
            />
          );
        })}
      </ToolItemList>
    </>
  );
};

interface ActionsProps {
  spaceID?: string;
  botId: string;
  pluginApis: EnabledPluginApi[];
  plugin: {
    api: EnabledPluginApi;
    info: PluginInfoForPlayground | undefined;
  };
  readonly: boolean;
  isBanned: boolean;
  handleDelete: (api: EnabledPluginApi, info?: PluginInfoForPlayground) => void;
  slot?: ReactNode;
}

const Actions: FC<ActionsProps> = ({
  botId,
  handleDelete,
  plugin,
  readonly,
  isBanned,
  spaceID,
  slot,
}) => {
  const { setIsForceShowAction } = useToolItemContext();

  const handleCopy = (text: string) => {
    const reportEvent = createReportEvent({
      eventName: ReportEventNames.copy,
      meta: { copyEvent: 'copy_api_name' },
    });

    try {
      const res = copy(text);
      if (!res) {
        throw new CustomError(ReportEventNames.copy, 'empty content');
      }
      reportEvent.success();
      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
        id: 'plugin_copy_id',
      });
    } catch {
      reportEvent.error({ reason: 'copy api name fail' });
      Toast.warning({
        content: I18n.t('copy_failed'),
        showClose: false,
      });
    }
  };

  const handleVisibleChange = (visible: boolean) => {
    setIsForceShowAction(visible);
  };

  return (
    <>
      {/* Icons - Info Tips */}
      <ParametersPopover
        pluginApi={plugin?.api as PluginApi}
        position="bottom"
        trigger="hover"
        onVisibleChange={visible => {
          handleVisibleChange(visible);
        }}
        disableFocusListener={isBanned}
      >
        <ToolItemIconInfo />
      </ParametersPopover>
      {/* Action copy */}
      <ToolItemActionCopy
        tooltips={I18n.t('bot_edit_page_plugin_copy_tool_name_tip')}
        onClick={() => handleCopy(plugin.api.name ?? '')}
        data-testid="bot.editor.tool.plugin.copy-button"
        disabled={isBanned}
      />
      {!readonly && (
        <>
          {slot}
          {/* Action settings */}
          <PluginSettingEnter
            bindSubjectInfo={{
              componentType: ComponentType.CozeTool,
              componentID: plugin.api.api_id,
              parentComponentType: ComponentType.CozePlugin,
              parentComponentID: plugin.api.plugin_id, // pluginId
              detail: { name: plugin.api.name },
            }}
            bizCtx={{
              trafficScene: TrafficScene.CozeSingleAgentDebug,
              trafficCallerID: botId,
              bizSpaceID: spaceID,
            }}
            plugin={plugin.info}
            apiInfo={plugin.api}
            botId={botId}
            devId={plugin.info?.creator?.id}
            disabled={isBanned}
          />
          {/* Action Delete */}
          <ToolItemActionDelete
            tooltips={I18n.t('Remove')}
            onClick={() => handleDelete(plugin.api, plugin.info)}
            data-testid="bot.editor.tool.task-manage.delete-button"
          />
        </>
      )}
    </>
  );
};
