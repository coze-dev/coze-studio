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

import { useRef, useState } from 'react';

import {
  type BindSubjectInfo,
  type BizCtxInfo,
} from '@coze-studio/mockset-shared';
import { I18n } from '@coze-arch/i18n';
import { Nav, UIModal } from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type PluginInfoForPlayground,
  type PluginApi,
} from '@coze-arch/bot-api/plugin_develop';

import { PartParams } from './part-params-set';
import { PartMockSet } from './part-mock-set';

import s from './index.module.less';

export interface SettingSlot {
  key: string;
  label: string;
  reactNode: React.ReactNode;
}

interface IProp {
  // mock-set
  bindSubjectInfo: BindSubjectInfo;
  bizCtx: BizCtxInfo;
  isDisabledMockSet?: boolean;
  // params
  botId?: string;
  devId?: string;
  pluginInfo?: PluginInfoForPlayground;
  apiInfo: PluginApi;
  // modal
  visible: boolean;
  doVisible: (v: boolean) => void;
  slotList?: SettingSlot[];
}

const MOCK_SET = 'MockSet';
const PARA = 'Parameters';

const usePartMainController = (pluginInfo: PluginInfoForPlayground) => {
  const [FLAGS] = useFlags();

  const [selectedKey, doSetSelectKey] = useState(
    FLAGS['bot.devops.plugin_mockset']
      ? MOCK_SET.toLocaleLowerCase()
      : PARA.toLocaleLowerCase(),
  );

  const keyOptions = [
    {
      label: I18n.t('bot_ide_plugin_setting_modal_parameter_tab'),
      value: PARA.toLowerCase(),
    },
  ];
  // Support soon, so stay tuned.
  if (FLAGS['bot.devops.plugin_mockset']) {
    keyOptions.unshift({
      label: I18n.t('bot_ide_plugin_setting_modal_mockset_tab'),
      value: MOCK_SET.toLowerCase(),
    });
  }

  return {
    selectedKey,
    doSetSelectKey,
    keyOptions,
  };
};

const PartMain = ({
  botId,
  devId,
  doVisible,
  visible,
  pluginInfo,
  apiInfo,
  bindSubjectInfo,
  bizCtx,
  isDisabledMockSet = !!0,
  slotList,
}: IProp) => {
  const { keyOptions, selectedKey, doSetSelectKey } =
    // @ts-expect-error -- linter-disable-autofix
    usePartMainController(pluginInfo);

  const contentRef = useRef<HTMLDivElement>();

  return (
    <UIModal
      width={1138}
      className={s['agent-skill-setting-modal-frame']}
      visible={visible}
      footer={null}
      onCancel={() => doVisible(!!0)}
      title={
        <div className="absolute w-[240px] left-[0] top-[0] p-[24px] bg-[#f0f0f5]">
          {I18n.t('basic_setting')}
        </div>
      }
    >
      <div className="flex h-[100%]">
        <Nav
          className="h-[100%]"
          selectedKeys={selectedKey ? [selectedKey] : [keyOptions?.[0].value]}
          onSelect={({ itemKey }) => doSetSelectKey(itemKey as string)}
        >
          {keyOptions.map(k => (
            <Nav.Item key={k.value} text={k.label} itemKey={k.value} />
          ))}
          {slotList?.map(item => (
            <Nav.Item key={item.key} itemKey={item.key} text={item.label} />
          ))}
        </Nav>
        <div
          className="p-[24px] flex-[1] bg-[#F7F7FA] h-[100%]"
          // @ts-expect-error -- linter-disable-autofix
          ref={contentRef}
        >
          {selectedKey === MOCK_SET.toLowerCase() && visible ? (
            <PartMockSet
              // @ts-expect-error -- linter-disable-autofix
              contentRef={contentRef}
              bindSubjectInfo={bindSubjectInfo}
              bizCtx={bizCtx}
              readonly={isDisabledMockSet}
            />
          ) : null}
          {selectedKey === PARA.toLowerCase() && visible ? (
            <PartParams
              // @ts-expect-error -- linter-disable-autofix
              contentRef={contentRef}
              apiName={apiInfo?.name}
              botId={botId}
              pluginId={apiInfo?.plugin_id}
              devId={devId}
            />
          ) : null}

          {visible
            ? slotList?.find(item => item.key === selectedKey)?.reactNode
            : null}
        </div>
      </div>
    </UIModal>
  );
};

export { PartMain };
