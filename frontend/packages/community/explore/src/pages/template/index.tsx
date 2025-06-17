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
