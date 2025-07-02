import { type ComponentProps } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { I18n } from '@coze-arch/i18n';
import { UICompositionModal, type Modal } from '@coze-arch/bot-semi';
import { OpenModeType } from '@coze-arch/bot-hooks';
import { type PluginModalModeProps } from '@coze-agent-ide/plugin-shared';
import { PluginFeatButton } from '@coze-agent-ide/bot-plugin-export/pluginFeatModal/featButton';
import { usePluginModalParts } from '@coze-agent-ide/bot-plugin-export/agentSkillPluginModal/hooks';

import s from './index.module.less';

export type PluginModalProps = ComponentProps<typeof Modal> &
  PluginModalModeProps & {
    type: number;
  };

export const PluginModal: React.FC<PluginModalProps> = ({
  type,
  openMode,
  from,
  openModeCallback,
  showButton,
  showCopyPlugin,
  onCopyPluginCallback,
  pluginApiList,
  projectId,
  clickProjectPluginCallback,
  hideCreateBtn,
  initQuery,
  ...props
}) => {
  const { pluginApis, updateSkillPluginApis } = useBotSkillStore(
    useShallow(store => ({
      pluginApis: store.pluginApis,
      updateSkillPluginApis: store.updateSkillPluginApis,
    })),
  );
  const getPluginApiList = () => {
    if (pluginApiList) {
      return pluginApiList;
    }
    return openMode === OpenModeType.OnlyOnceAdd ? [] : pluginApis;
  };
  const { sider, filter, content } = usePluginModalParts({
    // 如果是仅添加一次，清空默认选中
    pluginApiList: getPluginApiList(),
    onPluginApiListChange: updateSkillPluginApis,
    openMode,
    from,
    openModeCallback,
    showButton,
    showCopyPlugin,
    onCopyPluginCallback,
    projectId,
    clickProjectPluginCallback,
    onCreateSuccess: props?.onCreateSuccess,
    isShowStorePlugin: props?.isShowStorePlugin,
    hideCreateBtn,
    initQuery,
  });

  return (
    <UICompositionModal
      data-testid="plugin-modal"
      {...props}
      header={I18n.t('bot_edit_plugin_select_title')}
      className={classNames(s['plugin-modal'], props.className)}
      sider={sider}
      extra={!IS_OPEN_SOURCE ? <PluginFeatButton /> : null}
      filter={filter}
      content={content}
    />
  );
};
