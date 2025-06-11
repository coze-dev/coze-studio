import { I18n } from '@coze-arch/i18n';
import { explore } from '@coze-studio/api-schema';

import {
  PluginCard,
  type PluginCardProps,
  PluginCardSkeleton,
} from '@coze-community/components';

import { PageList } from '../../components/page-list';

export const PluginPage = () => (
  <PageList
    title={I18n.t('Plugins')}
    getDataList={getPluginData}
    renderCard={data => <PluginCard {...(data as PluginCardProps)} />}
    renderCardSkeleton={() => <PluginCardSkeleton />}
  />
);

const getPluginData = async () => {
  const result = await explore.PublicGetProductList({
    entity_type: explore.product_common.ProductEntityType.Plugin,
    sort_type: explore.product_common.SortType.Newest,
    page_num: 0,
    page_size: 1000,
  });
  return result.data?.products || [];
};
