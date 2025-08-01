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
import { UIButton } from '@coze-arch/bot-semi';
import { IconClose } from '@douyinfe/semi-icons';

import s from './index.module.less';

export interface PanelHeaderProps {
  onClose: () => void;
}

export const PanelHeader = (props: PanelHeaderProps) => {
  const { onClose } = props;
  return (
    <div className={s['panel-header']}>
      <div className={s['panel-header-title']}>
        {I18n.t('debug_detail_tab')}
      </div>
      <div className={s['panel-header-option']}>
        <UIButton
          className={s['panel-header-option-icon']}
          theme="borderless"
          icon={<IconClose />}
          size="small"
          onClick={onClose}
        />
      </div>
    </div>
  );
};
