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
 
import React from 'react';

import { type ApiNodeDetailDTO } from '@coze-workflow/nodes';
import { type DebugExample } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { useViewExample } from '@coze-agent-ide/bot-plugin-tools/useViewExample';
import { Typography, ConfigProvider } from '@coze-arch/coze-design';

interface Props {
  debugExample: DebugExample;
  inputs: ApiNodeDetailDTO['inputs'];
}

export const ViewExample = (props: Props) => {
  const { debugExample, inputs } = props;

  const { exampleNode, doShowExample } = useViewExample();

  const handleClick = () => {
    doShowExample({
      scene: 'workflow',
      requestParams: inputs,
      debugExample,
    });
  };

  if (!debugExample) {
    return null;
  }

  // workflow 比较特殊的点在于，节点级别的话，popupcontainer 是设置在节点而不是画布上
  // 因此这里需要通过 ConfigProvider 配置 popupContainer，覆盖 NodeRender 上的 ConfigProvider，
  // 否则在节点级别不会展示出来
  return (
    <ConfigProvider getPopupContainer={() => document.body}>
      {exampleNode}

      <Typography.Text
        className="cursor-pointer absolute top-[16px] right-[10px] text-xs"
        onClick={handleClick}
        link
      >
        {I18n.t('plugin_edit_tool_view_example')}
      </Typography.Text>
    </ConfigProvider>
  );
};
