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

import { useState } from 'react';

import { getOpenSDKUrl } from '@coze-studio/open-env-adapter';
import { I18n } from '@coze-arch/i18n';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';
import { Button, Modal, Typography } from '@coze-arch/coze-design';

import s from './index.module.less';

export interface WebSdkGuideParams {
  projectId: string;
  workflowId: string;
  token?: string;
  version?: string;
}

function getWebSdkScriptTagMD({
  projectId,
  workflowId,
  version = '<version>',
}: WebSdkGuideParams) {
  return `${'```'}html
<script type="text/javascript">
var webSdkScript = document.createElement('script');
webSdkScript.src = '${getOpenSDKUrl(version)}';
document.head.appendChild(webSdkScript);
webSdkScript.onload = function () {
  new CozeWebSDK.WebChatClient({
    "config": {
      "type": "app",
      "appInfo": {
        "appId": "${projectId}",
        "workflowId": "${workflowId}"
      }
    },
    "auth": {
      "type": "token",
      "token": "pat_********",
      onRefreshToken: function () {
        return "pat_********"
      }
    }
  });
}
</script>
${'```'}`;
}

function ListIndex({ index }: { index: number }) {
  return (
    <div className="w-[20px] h-[20px] rounded-full inline-flex items-center justify-center mr-[4px] coz-mg-primary">
      <span className="font-medium coz-fg-secondary">{index}</span>
    </div>
  );
}

export function useWebSdkGuideModal() {
  const [visible, setVisible] = useState(false);
  const [scriptTagMd, setScriptTagMd] = useState('');

  const show = (params: WebSdkGuideParams) => {
    const md = getWebSdkScriptTagMD(params);
    setScriptTagMd(md);
    setVisible(true);
  };
  const close = () => setVisible(false);

  const node = (
    <Modal
      title={I18n.t('app_publish_sdk_title')}
      closable
      visible={visible}
      width={640}
      onCancel={close}
      footer={
        <Button onClick={close}>{I18n.t('app_publish_sdk_confirm')}</Button>
      }
      // z-index requires a Popover greater than publish-status.
      zIndex={2000}
    >
      <Typography.Paragraph className="font-medium mb-[8px]">
        <ListIndex index={1} />
        {I18n.t('app_publish_sdk_step_1', {
          doc_link: (
            <Typography.Text
              link={{
                href: '/docs/developer_guides/oauth_apps',
                target: '_blank',
              }}
            >
              {I18n.t('app_publish_sdk_step_1_doc')}
            </Typography.Text>
          ),
        })}
      </Typography.Paragraph>
      <Typography.Paragraph className="font-medium mb-[8px]">
        <ListIndex index={2} />
        {I18n.t('app_publish_sdk_step_2')}
      </Typography.Paragraph>
      <MdBoxLazy className={s['web-sdk-guide']} markDown={scriptTagMd} />
      <Typography.Paragraph className="font-medium mb-[8px]">
        <ListIndex index={3} />
        {I18n.t('app_publish_sdk_step_3')}
      </Typography.Paragraph>
    </Modal>
  );

  return { node, show };
}
