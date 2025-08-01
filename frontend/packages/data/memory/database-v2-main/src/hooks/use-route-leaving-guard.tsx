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
