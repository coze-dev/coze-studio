import { I18n } from '@coze-arch/i18n';
import { Banner } from '@coze-arch/coze-design';

export const ConfigurationBanner = () => (
  <Banner
    style={{ marginTop: '10px' }}
    type="warning"
    description={I18n.t('knowledge_limit_20')}
  />
);
