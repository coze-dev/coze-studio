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
 * Get the path to bot details pages, not explore pages
 * @param {String} spaceID - space ID
 * @param {String} botID - bot ID
 */
export const getBotDetailPagePath = (spaceID: string, botID: string) =>
  `/space/${spaceID}/bot/${botID}`;

/**
 * Flatten bot diff data, flat subtree structure within array, and add hierarchy to each node
 * @param {Array < DiffDisplayNode & {level?: number} >} dataSource - space ID
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

// The old service number id to be offline.
export const OLD_WX_FWH_ID = '10000114';

// New WeChat service ID
export const NEW_WX_FWH_ID = '10000120';

// Store channel id
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

// New and old WeChat official account migration special judgment logic: When binding a new WeChat channel, it is prompted to unbind the bound old channel first to prevent repeated binding with the bot
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
