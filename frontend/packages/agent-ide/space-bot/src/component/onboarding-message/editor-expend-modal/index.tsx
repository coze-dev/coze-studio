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

import { type FC, type PropsWithChildren } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { UIModal, type UIModalProps } from '@coze-arch/bot-semi';
import { IconMinimizeOutlined } from '@coze-arch/bot-icons';

import styles from '../index.module.less';

export const EditorExpendModal: FC<PropsWithChildren<UIModalProps>> = ({
  children,
  ...modalProps
}) => (
  <UIModal
    {...modalProps}
    title={
      <div className="coz-fg-plus text-[20px] leading-8">
        {I18n.t('bot_edit_opening_text_title')}
      </div>
    }
    centered
    style={{
      maxWidth: 640,
      aspectRatio: 640 / 668,
      height: 'auto',
    }}
    bodyStyle={{
      padding: 0,
    }}
    className={styles['editor-expend-modal']}
    footer={null}
    type="base-composition"
    closeIcon={
      <Tooltip content={I18n.t('collapse')}>
        <IconMinimizeOutlined
          size="extra-large"
          className="cursor-pointer"
          onClick={modalProps.onCancel}
        />
      </Tooltip>
    }
  >
    {children}
  </UIModal>
);
