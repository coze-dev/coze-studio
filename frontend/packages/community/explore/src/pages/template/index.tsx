import { I18n } from '@coze-arch/i18n';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import {
  TemplateCard,
  type TemplateCardProps,
  TemplateCardSkeleton,
} from '@coze-community/components';

import { PageList } from '../../components/page-list';

export const TemplatePage = () => (
  <PageList
    title={I18n.t('template_name')}
    getDataList={() => mockData()}
    renderCard={data => <TemplateCard {...(data as TemplateCardProps)} />}
    renderCardSkeleton={() => <TemplateCardSkeleton />}
  />
);

const mockData = async () => {
  await (() =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, 3000);
    }))();
  return new Array(20).fill({
    title: '雅思口语专家',
    imgSrc:
      'https://p9-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/9fa1e35e946c4a9fbc18aace55270999~tplv-13w3uml6bg-resize:800:320.image?rk3s=2e2596fd&x-expires=1747907084&x-signature=rhFJg0fWiArAnBJYXim%2Bn4vUWFw%3D',
    description:
      '智能助教模板，可助力老师轻松备课与高效批阅作业，减轻教学压力。',
    entityType: ProductEntityType.BotTemplate,
    userInfo: {
      avatar_url:
        'https://p26-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/78f519713ce46901120fb7695f257c9a.png~tplv-13w3uml6bg-resize:128:128.image?rk3s=2e2596fd&x-expires=1747913134&x-signature=UKbjOSfmcZzay2j1OzEVwlwt7%2Fs%3D',
      name: '扣子官方',
      user_id: '0',
      user_name: '',
    },
  });
};
