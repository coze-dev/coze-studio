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

import { useMemo, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type GetPluginInfoResponse,
  type GetUpdatedAPIsResponse,
  type PluginAPIInfo,
  PluginType,
} from '@coze-arch/bot-api/plugin_develop';
import { IconChevronLeft } from '@douyinfe/semi-icons';
import { usePluginNavigate } from '@coze-studio/bot-plugin-store';
import { Button, IconButton, Tooltip } from '@coze-arch/coze-design';

import { OauthButtonAction } from '@/components/oauth-action';

import { useContentDebug } from './use-content-debug';

import s from './index.module.less';

interface ToolHeaderProps {
  space_id: string;
  plugin_id: string;
  unlockPlugin: () => void;
  tool_id: string;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  updatedInfo?: GetUpdatedAPIsResponse;
  apiInfo?: PluginAPIInfo;
  editVersion: number;
  canEdit: boolean;
  debugApiInfo?: PluginAPIInfo;
  onDebugSuccessCallback?: () => void;
}

const ToolHeader: FC<ToolHeaderProps> = ({
  space_id,
  plugin_id,
  unlockPlugin,
  tool_id,
  pluginInfo,
  updatedInfo,
  apiInfo,
  editVersion,
  canEdit,
  debugApiInfo,
  onDebugSuccessCallback,
}) => {
  const resourceNavigate = usePluginNavigate();

  const [FLAGS] = useFlags();
  const goBack = () => {
    resourceNavigate.toResource?.('plugin', plugin_id);
    unlockPlugin();
  };

  // management simulation set
  const handleManageMockset = () => {
    resourceNavigate.mocksetList?.(tool_id);
  };

  const mocksetDisabled = useMemo(
    () =>
      pluginInfo?.plugin_type === PluginType.LOCAL ||
      !pluginInfo?.published ||
      (pluginInfo?.status &&
        updatedInfo?.created_api_names &&
        Boolean(updatedInfo.created_api_names.includes(apiInfo?.name || ''))),
    [pluginInfo, updatedInfo, apiInfo],
  );

  const { modalContent: debugModalContent } = useContentDebug({
    debugApiInfo,
    canEdit,
    space_id: space_id || '',
    plugin_id: plugin_id || '',
    tool_id: tool_id || '',
    unlockPlugin,
    editVersion,
    pluginInfo,
    onDebugSuccessCallback,
  });

  return (
    <div className={s.header}>
      <div className={s['simple-title']}>
        {/* <UIBreadcrumb
          showTooltip={{
            width: '160px',
            opts: {
              style: { wordBreak: 'break-word' },
            },
          }}
          pluginInfo={pluginInfo?.meta_info}
          pluginToolInfo={apiInfo}
          compact={false}
          className={s.breadcrumb}
        /> */}
        <IconButton
          icon={<IconChevronLeft style={{ color: 'rgba(29, 28, 35, 0.6)' }} />}
          onClick={goBack}
          size="small"
          color="secondary"
        />
        <span className={s.title}>{I18n.t('plugin_edit_tool_title')}</span>
        <OauthButtonAction />
        {/* Support soon, so stay tuned. */}
        {FLAGS['bot.devops.plugin_mockset'] ? (
          <Tooltip
            style={{ display: mocksetDisabled ? 'block' : 'none' }}
            content={I18n.t('unreleased_plugins_tool_cannot_create_mockset')}
            position="left"
            trigger="hover"
          >
            <Button
              onClick={handleManageMockset}
              disabled={mocksetDisabled}
              color="primary"
              style={{ marginRight: 8 }}
            >
              {I18n.t('manage_mockset')}
            </Button>
          </Tooltip>
        ) : null}
        {canEdit ? debugModalContent : null}
      </div>
    </div>
  );
};

export { ToolHeader };
