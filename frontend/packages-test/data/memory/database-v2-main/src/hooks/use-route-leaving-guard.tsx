import { useBlocker } from 'react-router-dom';

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';

export const useRouteLeavingGuard = (when: boolean) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  const modal = (
    <Modal
      title={I18n.t('db2_027')}
      visible={blocker.state === 'blocked'}
      onOk={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
      okText={I18n.t('db2_004')}
      cancelText={I18n.t('db2_028')}
      closeOnEsc={true}
    >
      {I18n.t('db2_029')}
    </Modal>
  );

  return {
    modal,
  };
};
