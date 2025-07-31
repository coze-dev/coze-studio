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

import { Tooltip, Typography } from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

export const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <div className="flex items-center">
    <Typography.Text
      className="mr-[8px]"
      ellipsis={{
        showTooltip: { opts: { content: label } },
      }}
      style={{ maxWidth: 160 }}
    >
      {label}
    </Typography.Text>
    <Tooltip content={tooltip}>
      <IconInfo style={{ color: 'rgba(167, 169, 176, 1)' }} />
    </Tooltip>
  </div>
);
