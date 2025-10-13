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

import {
  PluginCard,
  type PluginCardProps,
  PluginCardSkeleton,
  TemplateCard,
  type TemplateCardProps,
  TemplateCardSkeleton,
} from '@coze-community/components';
import {
  ProductEntityType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';

interface SearchCardProps {
  detail: ProductInfo;
  entityType: ProductEntityType;
  className?: string;
}

export const SearchCard = (props: SearchCardProps) => {
  const { detail, entityType, className } = props;

  switch (detail.meta_info.entity_type ?? entityType) {
    case ProductEntityType.Plugin:
    case ProductEntityType.SaasPlugin:
      return (
        <PluginCard {...(detail as PluginCardProps)} className={className} />
      );
    case ProductEntityType.BotTemplate:
    case ProductEntityType.ImageflowTemplateV2:
    case ProductEntityType.WorkflowTemplateV2:
    case ProductEntityType.ProjectTemplate:
    case ProductEntityType.TemplateCommon:
      return <TemplateCard {...(detail as TemplateCardProps)} />;
    default:
      return null;
  }
};

export const SearchSkeleton = (props: { entityType: ProductEntityType }) => {
  const { entityType } = props;

  switch (entityType) {
    case ProductEntityType.Plugin:
      return <PluginCardSkeleton />;
    case ProductEntityType.TemplateCommon:
      return <TemplateCardSkeleton />;
    default:
      return null;
  }
};
