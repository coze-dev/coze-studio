import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import {
  useTermServiceModal,
  type TermServiceInfo,
} from './term-service-modal';

export const PublishTermService = ({
  termServiceData,
  scene = 'bot',
  className,
}: {
  termServiceData: TermServiceInfo[];
  scene?: 'bot' | 'project';
  className?: string;
}) => {
  const { node: termServiceModal, open: openTermServiceModal } =
    useTermServiceModal({
      dataSource: termServiceData,
    });

  const BotScene = scene === 'bot';
  return (
    <>
      {termServiceModal}
      <Typography.Text
        className={classNames(
          'py-[12px] coz-fg-primary leading-[16px]',
          className,
        )}
      >
        {I18n.t(
          BotScene
            ? 'bot_publish_select_desc_compliance_new'
            : 'project_publish_select_desc_compliance_new',
          {
            publish_terms_title: (
              <Typography.Text
                link
                onClick={openTermServiceModal}
                className="!coz-fg-hglt !font-normal"
              >
                {I18n.t('publish_terms_title')}
              </Typography.Text>
            ),
          },
        )}
      </Typography.Text>
    </>
  );
};
