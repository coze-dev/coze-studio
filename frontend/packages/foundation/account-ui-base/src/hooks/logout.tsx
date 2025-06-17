import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { logout } from '@coze-foundation/account-adapter';

export interface UseLogoutReturnType {
  open: () => void;
  close: () => void;
  node: JSX.Element;
}

export const useLogout = (): UseLogoutReturnType => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const node = (
    <Modal
      visible={visible}
      title={I18n.t('log_out_desc')}
      okText={I18n.t('basic_log_out')}
      cancelText={I18n.t('Cancel')}
      centered
      onOk={async () => {
        await logout();
        setVisible(false);
        // 跳转到根路径
        navigate('/');
      }}
      onCancel={() => {
        setVisible(false);
      }}
      okButtonColor="red"
    />
  );

  return {
    node,
    open: () => {
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  };
};
