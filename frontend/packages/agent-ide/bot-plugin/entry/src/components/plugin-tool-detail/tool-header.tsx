import { useMemo, type FC } from 'react';

// import { UIBreadcrumb } from '@coze-studio/components';
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

  // 管理模拟集
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
        {/* 社区版暂不支持该功能 */}
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
