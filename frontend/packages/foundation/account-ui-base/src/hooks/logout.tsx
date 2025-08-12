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
        // Jump to root path
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
