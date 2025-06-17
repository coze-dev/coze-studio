import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { EmptyState } from '@coze-arch/coze-design';

export const EmptyRecommend = () => (
  <div className="flex h-full items-center justify-center">
    <EmptyState
      title={I18n.t('prompt_library_empty_title')}
      icon={<IconCozEmpty />}
      style={{ maxWidth: '300px' }}
    />
  </div>
);
