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

import { type FC, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { groupBy } from 'lodash-es';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  AddButton,
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { I18n } from '@coze-arch/i18n';
import {
  removeEvent,
  OpenModalEvent,
  OpenBlockEvent,
  handleEvent,
} from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type PluginInfoForPlayground } from '@coze-arch/bot-api/plugin_develop';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { handlePluginRiskWarning } from '@coze-agent-ide/plugin-risk-warning';
import { PluginContent } from '@coze-agent-ide/plugin-content-adapter';
import { usePluginApisModal } from '@coze-agent-ide/bot-plugin/component';

import s from './index.module.less';

export type IPluginApisAreaProps = ToolEntryCommonProps;

export const PluginApisArea: FC<IPluginApisAreaProps> = ({ title }) => {
  const [plugins, setPlugins] = useState<PluginInfoForPlayground[]>([]);

  const pluginApis = useBotSkillStore(state => state.pluginApis);

  const { botId } = useBotInfoStore(
    useShallow(store => ({
      botId: store.botId,
    })),
  );
  const { init } = usePageRuntimeStore(
    useShallow(store => ({
      init: store.init,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();
  const { node, open } = usePluginApisModal();
  const spaceID = useSpaceStore(store => store.space.id);
  const setToolValidData = useToolValidData();

  const prevLength = useRef(pluginApis.length);

  const updatePluginApis = () => {
    if (!pluginApis.length) {
      return;
    }
    setPlugins(
      pluginApis.map(item => ({
        ...item,
        id: item.plugin_id,
        name: item.plugin_name,
      })),
    );
  };

  useEffect(() => {
    setToolValidData(Boolean(pluginApis.length));

    const len = Object.keys(groupBy(pluginApis, api => api.plugin_id)).length;
    if (init || len > prevLength.current) {
      updatePluginApis();
    }

    prevLength.current = len;
  }, [pluginApis.length, init]);

  // @ts-expect-error -- linter-disable-autofix
  const openHandler = $data => {
    open(($data as unknown as { type: number }).type);
  };

  useEffect(() => {
    handleEvent(OpenModalEvent.PLUGIN_API_MODAL_OPEN, openHandler);
    return () => {
      removeEvent(OpenModalEvent.PLUGIN_API_MODAL_OPEN, openHandler);
    };
  }, [open]);

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.PLUGIN_API_BLOCK,
    configured: pluginApis.length > 0,
  });

  return (
    <>
      {node}
      <ToolContentBlock
        blockEventName={OpenBlockEvent.PLUGIN_API_BLOCK_OPEN}
        header={title}
        defaultExpand={defaultExpand}
        actionButton={
          <>
            <AddButton
              tooltips={I18n.t('bot_edit_plugin_add_tooltip')}
              onClick={() => {
                open();
                handlePluginRiskWarning();
              }}
              enableAutoHidden={true}
              data-testid="bot.editor.tool.plugin.add-button"
            />
          </>
        }
      >
        <div className={s['tools-content']}>
          {pluginApis.length ? (
            <>
              <PluginContent
                spaceID={spaceID}
                botId={botId}
                pluginApis={pluginApis}
                plugins={plugins}
                readonly={isReadonly}
              />
            </>
          ) : (
            <div
              className={s['default-text']}
              data-testid="bot.ide.bot_creator.bot_edit_plugin_explain"
            >
              {I18n.t('bot_edit_plugin_explain')}
            </div>
          )}
        </div>
      </ToolContentBlock>
    </>
  );
};
