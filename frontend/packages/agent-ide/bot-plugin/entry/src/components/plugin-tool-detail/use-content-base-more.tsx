import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type UpdateAPIResponse,
  type GetPluginInfoResponse,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { IconEdit } from '@coze-arch/bot-icons';
import { useBaseMore } from '@coze-agent-ide/bot-plugin-tools/useBaseMore';
import { REQUESTNODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { Button } from '@coze/coze-design';

import { SecurityCheckFailed } from '@/components/check_failed';

interface UseContentBaseInfoProps {
  plugin_id: string;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  tool_id: string;
  apiInfo?: PluginAPIInfo;
  space_id: string;
  canEdit: boolean;
  handleInit: (loading?: boolean) => Promise<void>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  editVersion?: number;
  callback?: (params: UpdateAPIResponse) => void;
}

export const useContentBaseMore = ({
  plugin_id,
  pluginInfo,
  tool_id,
  apiInfo,
  space_id,
  canEdit,
  handleInit,
  wrapWithCheckLock,
  editVersion,
  callback,
}: UseContentBaseInfoProps) => {
  // 是否显示安全检查失败信息
  const [showSecurityCheckFailedMsg, setShowSecurityCheckFailedMsg] =
    useState(false);
  const [isBaseMoreDisabled, setIsBaseMoreDisabled] = useState(true);

  // 基本信息
  const { baseInfoNode, submitBaseInfo } = useBaseMore({
    pluginId: plugin_id || '',
    pluginMeta: pluginInfo?.meta_info || {},
    apiId: tool_id,
    baseInfo: apiInfo,
    showModal: false,
    disabled: isBaseMoreDisabled,
    showSecurityCheckFailedMsg,
    setShowSecurityCheckFailedMsg,
    editVersion,
    pluginType: pluginInfo?.plugin_type,
    spaceId: space_id,
    callback,
  });

  return {
    isBaseMoreDisabled,
    header: I18n.t('project_plugin_setup_metadata_more_info'),
    itemKey: 'baseMore',
    extra: (
      <>
        {showSecurityCheckFailedMsg ? (
          <SecurityCheckFailed step={REQUESTNODE} />
        ) : null}
        {!isBaseMoreDisabled && (
          <Button
            color="primary"
            className="mr-2"
            onClick={e => {
              e.stopPropagation();
              setIsBaseMoreDisabled(true);
            }}
          >
            {I18n.t('project_plugin_setup_metadata_cancel')}
          </Button>
        )}
        {canEdit && !isBaseMoreDisabled ? (
          <Button
            onClick={async e => {
              e.stopPropagation();
              const status = await submitBaseInfo();
              // 更新成功后进入下一步
              if (status) {
                handleInit();
              }
              setIsBaseMoreDisabled(true);
            }}
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_save')}
          </Button>
        ) : null}
        {canEdit && isBaseMoreDisabled ? (
          <Button
            icon={<IconEdit className="!pr-0" />}
            color="primary"
            className="!bg-transparent !coz-fg-secondary"
            onClick={e => {
              const el = document.querySelector(
                '.plugin-tool-detail-baseMore .semi-collapsible-wrapper',
              ) as HTMLElement;
              if (parseInt(el?.style?.height) !== 0) {
                e.stopPropagation();
              }
              wrapWithCheckLock(() => {
                setIsBaseMoreDisabled(false);
              })();
            }}
          >
            {I18n.t('project_plugin_setup_metadata_edit')}
          </Button>
        ) : null}
      </>
    ),
    content: baseInfoNode,
    classNameWrap: 'plugin-tool-detail-baseMore',
  };
};
