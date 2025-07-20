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
 
import { type SetStateAction } from 'react';

import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { UIButton } from '@coze-arch/bot-semi';
import {
  type PublishConnectorInfo as BotPublishConnectorInfo,
  ConfigStatus,
} from '@coze-arch/bot-api/developer_api';
import { useParams } from 'react-router-dom';

import { useConnectorFormModal } from '../bind-connector-modal/use-connector-form-modal';
import { OLD_WX_FWH_ID } from '../../util';

interface KvBindButtonProps {
  setDataSource?: (value: SetStateAction<BotPublishConnectorInfo[]>) => void;
  setSelectedPlatforms?: (id: SetStateAction<string[]>) => void;
  record: BotPublishConnectorInfo | PublishConnectorInfo;
  /** 渠道配置成功的回调。若不传入 `unbindCallback`，解绑渠道也会调用该回调，且 bind_id 为空字符串 `''` */
  bindSuccessCallback?: (value: PublishConnectorInfo | undefined) => void;
  /** 解绑渠道的回调 */
  unbindCallback?: () => void;
  /** 绑定的 agent_type 。默认为 bot */
  origin?: 'project' | 'bot';
  /** 绑定的 bot_id/project_id 。不传则根据 origin 从路由参数中获取 */
  originId?: string;
}

export const KvBindButton = ({
  setDataSource,
  setSelectedPlatforms,
  record,
  bindSuccessCallback,
  unbindCallback,
  origin = 'bot',
  originId,
}: KvBindButtonProps) => {
  const { bot_id = '', project_id = '' } = useParams<DynamicParams>();
  // 传给后端的参数名字是 bot_id，另外使用参数 agent_type 来区分 0-bot 1-project
  const botId = originId ?? (origin === 'bot' ? bot_id : project_id);
  const bindSuccessCb = (
    value: BotPublishConnectorInfo | PublishConnectorInfo | undefined,
  ) => {
    if (bindSuccessCallback) {
      bindSuccessCallback(value as PublishConnectorInfo);
      return;
    }
    setDataSource?.((list: BotPublishConnectorInfo[]) => {
      const target = list.find(l => l.id === value?.id);
      if (target) {
        // 解绑旧的服务号后，需要隐藏掉旧的服务号渠道，不允许再绑定
        if (target.id === OLD_WX_FWH_ID && !value?.bind_id) {
          return list.filter(item => item.id !== OLD_WX_FWH_ID);
        }
        target.bind_id = value?.bind_id;
        target.bind_info = value?.bind_info ?? {};
        target.config_status = value?.bind_id
          ? ConfigStatus.Configured
          : ConfigStatus.NotConfigured;
      }

      return [...list];
    });

    if (!value?.bind_id) {
      setSelectedPlatforms?.(list => list.filter(item => item !== value?.id));
    }
  };
  const { node: connectorFormModal, open: openConnectorsForm } =
    useConnectorFormModal({
      botId,
      origin,
      onSuccess: bindSuccessCb,
      onUnbind: unbindCallback,
    });

  const handleConfigure = () => openConnectorsForm({ initValue: record });
  const buttonText = I18n.t('bot_publish_action_configure');

  return (
    <>
      {origin === 'project' ? (
        <Button onClick={handleConfigure} size="small" color="primary">
          {buttonText}
        </Button>
      ) : (
        <UIButton onClick={handleConfigure} theme="borderless">
          {buttonText}
        </UIButton>
      )}
      {connectorFormModal}
    </>
  );
};
