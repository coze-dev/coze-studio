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
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import styles from '../index.module.less';
import { ReactComponent as IconImageBroken } from '../../assets/coz_image_broken.svg';

interface LoadErrorProps {
  onClose?: VoidFunction;
}

export const LoadError = ({ onClose }: LoadErrorProps) => (
  <div className={styles.wrapper}>
    <div className={styles.header}>
      <div className={styles.title}>
        {I18n.t('analytics_query_aigc_infopanel_title')}
      </div>
      <Button
        icon={<IconCozCross className="w-4 h-4" />}
        color="secondary"
        className="w-4 h-4"
        onClick={onClose}
      ></Button>
    </div>
    <div className={styles.body}>
      <IconImageBroken className="w-[64px] h-[64px]" />
      <span className={styles['error-txt']}>
        {I18n.t('analytics_query_aigc_errorpanel_context')}
      </span>
    </div>
    <div className={styles.footer}>
      <Button type="primary" size="default" onClick={onClose}>
        {I18n.t('analytics_query_aigc_errorpanel_ok')}
      </Button>
    </div>
  </div>
);
