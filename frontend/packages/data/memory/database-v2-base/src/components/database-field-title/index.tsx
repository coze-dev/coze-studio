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

import { type ReactNode } from 'react';

import { type FieldItemType } from '@coze-arch/bot-api/developer_api';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze-arch/coze-design';

import { FIELD_TYPE_OPTIONS } from '../../constants/database-field';

export interface DatabaseFieldTitleProps {
  field?: string;
  textType?: 'primary' | 'secondary';
  type?: FieldItemType;
  tip?: ReactNode;
  required?: boolean;
}

export function DatabaseFieldTitle({
  field,
  textType = 'secondary',
  type,
  tip,
  required,
}: DatabaseFieldTitleProps) {
  return (
    <div className="flex flex-row items-center">
      <Typography.Text type={textType} weight={500} fontSize="12px" ellipsis>
        {field}
      </Typography.Text>
      {required ? (
        <span className="coz-fg-hglt-red text-[12px] leading-[16px]">*</span>
      ) : null}
      {tip ? (
        <Tooltip content={tip} style={{ maxWidth: 'unset' }}>
          <IconCozInfoCircle className="w-[12px] h-[12px] ml-[3px] coz-fg-secondary" />
        </Tooltip>
      ) : null}
      {typeof type === 'number' ? (
        <Tag color="primary" size="mini" className="ml-[4px]">
          {FIELD_TYPE_OPTIONS.find(i => i.value === type)?.label ?? type}
        </Tag>
      ) : null}
    </div>
  );
}
