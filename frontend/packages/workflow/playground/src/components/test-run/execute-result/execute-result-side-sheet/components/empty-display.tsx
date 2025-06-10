import { IconCozPlayCircle } from '@coze/coze-design/icons';
import { Typography } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

const { Title, Text } = Typography;

export const EmptyDisplay = () => (
  <div className="h-full flex flex-col justify-center items-center">
    <div>
      <IconCozPlayCircle fontSize={44} className="coz-fg-dim" />
    </div>
    <div className="w-60 flex flex-col items-center">
      <Title heading={6} weight={500}>
        {I18n.t('workflow_running_results_noresult_title')}
      </Title>
      <Text type="quaternary" size="small">
        {I18n.t('workflow_running_results_noresult_content')}
      </Text>
    </div>
  </div>
);
