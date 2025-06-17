import { useState } from 'react';

import { PatBody } from '@coze-studio/open-auth';
import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import { Modal } from '@coze-arch/coze-design';

export const ApiBindButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <UIButton
        theme="borderless"
        onClick={() => {
          setVisible(true);
        }}
      >
        {I18n.t('bot_publish_action_configure')}
      </UIButton>
      <Modal
        size="xl"
        // @ts-expect-error -- ignore
        title={I18n.t('menu_profile_api_auth')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <PatBody size="small" type="primary" />
      </Modal>
    </>
  );
};
