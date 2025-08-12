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

import { Space, Image, Typography, Tooltip } from '@coze-arch/coze-design';

const doRenderTooltip = (content, children) => (
  <Tooltip content={content}>{children}</Tooltip>
);

const NameWithIcon = ({ name, icon }: { name: string; icon: string }) => (
  <Space spacing={8}>
    <Image src={icon} width={32} height={32} preview={false}></Image>
    <Typography.Text
      className="text-[12px] font-medium leading-[16px] w-[70px]"
      ellipsis={{
        showTooltip: {
          renderTooltip: doRenderTooltip,
        },
      }}
    >
      {name}
    </Typography.Text>
  </Space>
);

export { NameWithIcon };
