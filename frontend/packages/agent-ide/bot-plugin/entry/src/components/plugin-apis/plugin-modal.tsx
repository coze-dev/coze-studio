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
    // If it is added only once, clear the default selection.
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
