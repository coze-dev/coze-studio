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
 
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { type DiffDisplayNode } from '@coze-arch/bot-api/dp_manage_api';
import {
  PublishResultStatus,
  type ConnectorBindResult,
  type PublishConnectorInfo,
} from '@coze-arch/bot-api/developer_api';

import { type ConnectResultInfo } from '../type';

export { skillKeyToApiStatusKeyTransformer } from '@coze-arch/bot-utils';

export {
  checkAuthInfoValid,
  executeAuthRedirect,
  logAndToastAuthInfoError,
  useRevokeAuth,
} from './auth';

/**
 * 获得bot详情页的path，非explore页面
 * @param {String} spaceID - 空间ID
 * @param {String} botID - bot ID
 */
export const getBotDetailPagePath = (spaceID: string, botID: string) =>
  `/space/${spaceID}/bot/${botID}`;

/**
 * 打平bot diff data，flat数组内的子树结构，并添加层级到每个节点中
 * @param {Array<DiffDisplayNode & { level?: number }>} dataSource - 空间ID
 * @param {String} botID - bot ID
 */
export const flatDataSource = (
  dataSource: Array<DiffDisplayNode & { level?: number }>,
  level = 0,
) => {
  const res: DiffDisplayNode[] = [];
  dataSource?.forEach(item => {
    item.level = level;
    res.push(item);
    if (item.sub_nodes) {
      res.push(...flatDataSource(item.sub_nodes, level + 1));
    }
  });
  return res;
};

export const setPCBodyWithDebugPanel = () => {
  const bodyStyle = document.body.style;
  const htmlStyle = document.getElementsByTagName('html')[0].style;
  bodyStyle.minHeight = '600px';
  htmlStyle.minHeight = '600px';
  bodyStyle.minWidth = '1680px';
  htmlStyle.minWidth = '1680px';
};

// 旧的要下线的服务号id
export const OLD_WX_FWH_ID = '10000114';

// 新的微信服务号id
export const NEW_WX_FWH_ID = '10000120';

// store渠道的id
export const STORE_CONNECTOR_ID = '10000122';

export const getPublishResult: (
  publishResult: Record<string, ConnectorBindResult>,
  connectInfoList: PublishConnectorInfo[],
) => ConnectResultInfo[] = (publishResult, connectInfoList) => {
  if (!connectInfoList?.length) {
    return [];
  }
  return connectInfoList.map(item => {
    const result = publishResult?.[item.id] ?? {};
    return {
      ...item,
      publish_status:
        result.publish_result_status ?? PublishResultStatus.Failed,
      fail_text: result.msg ?? '',
      share_link: result.connector?.share_link ?? '',
      bind_info: result.connector?.bind_info ?? item.bind_info,
    };
  });
};

// 新旧微信公众号迁移特判逻辑：当绑定新微信渠道时，提示先解绑已绑定的旧的渠道，防止同bot重复绑定
export const isWeChatMigration = (
  record: PublishConnectorInfo,
  dataSource: PublishConnectorInfo[],
): boolean => {
  const hasBindOldWeChatId = dataSource.find(
    i => i.id === OLD_WX_FWH_ID,
  )?.bind_id;
  if (hasBindOldWeChatId && record.id === NEW_WX_FWH_ID) {
    UIModal.warning({
      title: I18n.t('publish_wechat_old_disconnect_title'),
      content: I18n.t('publish_wechat_old_disconnect'),
      okText: I18n.t('got_it'),
      hasCancel: false,
    });
    return true;
  } else {
    return false;
  }
};
export const safeJSONParse = (data?: string) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return '';
  }
};
