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

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  IconCozBot,
  IconCozWorkflow,
  IconCozWorkspace,
} from '@coze-arch/coze-design/icons';
import { Tag, type TagProps } from '@coze-arch/coze-design';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

interface IProps {
  type: ProductEntityType;
}

interface TagConfig {
  icon: ReactNode;
  i18nKey: I18nKeysNoOptionsType;
}

const TYPE_ICON_MAP: Partial<Record<ProductEntityType, TagConfig>> = {
  [ProductEntityType.BotTemplate]: {
    icon: <IconCozBot />,
    i18nKey: 'template_agent',
  },
  [ProductEntityType.WorkflowTemplateV2]: {
    icon: <IconCozWorkflow />,
    i18nKey: 'template_workflow',
  },
  [ProductEntityType.ImageflowTemplateV2]: {
    icon: <IconCozWorkflow />,
    i18nKey: 'template_workflow',
  },
  [ProductEntityType.ProjectTemplate]: {
    icon: <IconCozWorkspace />,
    i18nKey: 'project_store_search',
  },
};

const TYPE_COLOR_MAP: Partial<Record<ProductEntityType, TagProps['color']>> = {
  [ProductEntityType.BotTemplate]: 'primary',
  [ProductEntityType.WorkflowTemplateV2]: 'primary',
  [ProductEntityType.ImageflowTemplateV2]: 'primary',
  [ProductEntityType.ProjectTemplate]: 'brand',
};

export const CardTag = ({ type }: IProps) => {
  const config = TYPE_ICON_MAP[type];
  if (!config) {
    return null;
  }

  return (
    <Tag
      color={TYPE_COLOR_MAP[type] ?? 'primary'}
      className="h-[20px] !px-[4px] !py-[2px] coz-fg-primary font-medium shrink-0"
    >
      {config.icon}
      <span className="ml-[2px]">{I18n.t(config.i18nKey)}</span>
    </Tag>
  );
};
