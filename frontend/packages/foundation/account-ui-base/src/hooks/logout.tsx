/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { logout } from '@coze-foundation/account-adapter';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { BDSSO, BDSSOType } from '@byted-sdk/bdsso';

export const bdsso = BDSSO.config({
  type: BDSSOType.CAS,
  aid: 'id1y2p0ir34tlac1j8km',
  redirectUrl: 'https://ecomcoze.tiktok-row.net',
});

export function bdSSOLogin() {
  bdsso.login();
}

export function bdSSOLogout() {
  bdsso.logout();
}
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
        bdSSOLogout();
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
