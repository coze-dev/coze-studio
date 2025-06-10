import { type PropsWithChildren } from 'react';

import { useRequest } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';
import { usePluginNavigate } from '@coze-studio/bot-plugin-store';
import { Popover, Toast } from '@coze/coze-design';

import { PluginPublishUI, type PublishCallbackParams } from './base';

export interface BizPluginPublishPopoverProps {
  pluginId: string;
  isPluginHasPublished: boolean;
  visible: boolean;
  onClickOutside: () => void;
  onPublishSuccess: () => void;
  pluginInfo: PluginInfoProps;
  spaceId: string | undefined;
  isInLibraryScope: boolean;
}

export const BizPluginPublishPopover: React.FC<
  PropsWithChildren<BizPluginPublishPopoverProps>
> = ({
  children,
  pluginId,
  spaceId,
  isPluginHasPublished,
  visible,
  onClickOutside,
  onPublishSuccess,
  pluginInfo,
  isInLibraryScope,
}) => {
  const resourceNavigate = usePluginNavigate();
  const { data: nextVersionName, refresh: refreshNextVersionName } = useRequest(
    async () => {
      if (!spaceId) {
        return;
      }
      const response = await PluginDevelopApi.GetPluginNextVersion({
        space_id: spaceId,
        plugin_id: pluginId,
      });
      return response.next_version_name;
    },
    {
      ready: isInLibraryScope,
    },
  );
  const { run: requestPublish, loading } = useRequest(
    async ({ versionDescValue }: PublishCallbackParams) => {
      const res = await PluginDevelopApi.PublishPlugin({
        plugin_id: pluginId,
        ...versionDescValue,
      });
      return res;
    },
    {
      manual: true,
      onSuccess: () => {
        onPublishSuccess();
        Toast.success({
          content: I18n.t('Plugin_publish_update_toast_success'),
          showClose: false,
        });
        resourceNavigate.toResource?.('plugin');
        refreshNextVersionName();
      },
      onError: (error, [inputParams]) => {
        logger.persist.error({
          eventName: 'fail_to_publish_plugin',
          error,
        });
      },
    },
  );
  return (
    <Popover
      visible={visible}
      onClickOutSide={onClickOutside}
      trigger="custom"
      content={
        <PluginPublishUI
          onClickPublish={requestPublish}
          className="w-[400px] px-20px pt-16px pb-20px"
          publishButtonProps={{
            loading,
          }}
          initialVersionName={nextVersionName}
        />
      }
    >
      {children}
    </Popover>
  );
};
