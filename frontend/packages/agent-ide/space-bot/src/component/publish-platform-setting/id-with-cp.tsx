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
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { IconButton, Space, Tooltip, Typography } from '@coze-arch/coze-design';

const doRenderTooltip = (content, children) => (
  <Tooltip content={content}>{children}</Tooltip>
);

const IdWithCopy = ({
  id,
  doCopy,
}: {
  id: string;
  doCopy?: (id: string) => void;
}) => (
  <Space spacing={4}>
    <Typography.Text
      className="text-[12px] font-medium leading-[16px] w-[80px]"
      ellipsis={{
        showTooltip: {
          renderTooltip: doRenderTooltip,
        },
      }}
    >
      {id}
    </Typography.Text>
    <Tooltip content={I18n.t('copy')}>
      <IconButton
        onClick={() => doCopy?.(id)}
        color="secondary"
        icon={<IconCozCopy className="text-base" />}
        size="mini"
      />
    </Tooltip>
  </Space>
);

export { IdWithCopy };
