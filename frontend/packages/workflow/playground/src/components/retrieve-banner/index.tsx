import { I18n } from '@coze-arch/i18n';
import { Banner } from '@coze/coze-design';
import { Typography } from '@coze-arch/bot-semi';

import { useRetrieve } from './use-retrieve';

const { Text } = Typography;

const RetrieveBanner = () => {
  const { showRetrieve, author, handleRetrieve } = useRetrieve();

  if (!showRetrieve || IS_BOT_OP) {
    return null;
  }

  return (
    <Banner
      type="info"
      icon={null}
      closeIcon={null}
      description={
        <Text>
          {I18n.t('workflow_publish_multibranch_merge_comfirm_desc', {
            user_name: author,
          })}
          <Text link onClick={handleRetrieve} style={{ marginLeft: 8 }}>
            {I18n.t('workflow_publish_multibranch_merge_retrieve')}
          </Text>
        </Text>
      }
    />
  );
};

export default RetrieveBanner;
