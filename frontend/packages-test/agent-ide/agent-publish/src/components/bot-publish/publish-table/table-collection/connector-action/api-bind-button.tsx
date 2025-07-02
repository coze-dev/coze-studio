import { useState } from 'react';

import { PatBody } from '@coze-studio/open-auth';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';

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
        title={I18n.t('settings_api_authorization')}
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
