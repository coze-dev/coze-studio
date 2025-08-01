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

import { explore } from '@coze-studio/api-schema';
import {
  TemplateCard,
  type TemplateCardProps,
  TemplateCardSkeleton,
} from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';

import { PageList } from '../../components/page-list';

export const TemplatePage = () => (
  <PageList
    title={I18n.t('template_name')}
    getDataList={() => getTemplateData()}
    renderCard={data => <TemplateCard {...(data as TemplateCardProps)} />}
    renderCardSkeleton={() => <TemplateCardSkeleton />}
  />
);

const getTemplateData = async () => {
  const result = await explore.PublicGetProductList({
    entity_type: explore.product_common.ProductEntityType.TemplateCommon,
    sort_type: explore.product_common.SortType.Newest,
    page_num: 0,
    page_size: 1000,
  });
  return result.data?.products || [];
};
