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

import { type FC } from 'react';

import cs from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';

import { usePluginFeatModal } from '..';

import styles from './index.module.less';

export const PluginFeatButton: FC<{
  className?: string;
}> = ({ className }) => {
  const { modal, open } = usePluginFeatModal();

  return (
    <div className={cs(styles.wrapper, className)}>
      {modal}
      <span className={styles.tip}>{I18n.t('plugin_feedback_entry_tip')}</span>
      <UIButton type="tertiary" onClick={open}>
        {I18n.t('plugin_feedback_entry_button')}
      </UIButton>
    </div>
  );
};
