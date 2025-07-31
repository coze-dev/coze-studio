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

import { I18n } from '@coze-arch/i18n';
import { IconCozAdjust } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { useChatFlowTestFormStore } from './test-form-provider';

import css from './test-form-float-button.module.less';

export const TestFormFloatButton = ({
  isChatError,
}: {
  isChatError?: boolean;
}) => {
  const { hasForm, patch } = useChatFlowTestFormStore(store => ({
    hasForm: store.hasForm,
    patch: store.patch,
  }));

  const handleOpenForm = () => {
    patch({ visible: true });
  };

  if (!hasForm) {
    return null;
  }

  return (
    <>
      <div
        className={css['float-button']}
        onClick={handleOpenForm}
        style={
          isChatError === true
            ? { position: 'absolute', left: 69, bottom: 123 }
            : {}
        }
      >
        <Typography.Text className="coz-fg-primary">
          {I18n.t('wf_chatflow_71')}
        </Typography.Text>
        <IconCozAdjust className="coz-fg-dim" />
      </div>
    </>
  );
};
