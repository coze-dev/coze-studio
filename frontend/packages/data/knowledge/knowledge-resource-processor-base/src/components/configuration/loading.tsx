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
import { Spin } from '@coze-arch/coze-design';

import styles from './index.module.less';

export const ConfigurationLoading = () => (
  <div className={styles.loading}>
    <Spin spinning></Spin>
    <div className={styles['loading-content']}>
      {I18n.t('knowledge_1221_03')}
    </div>
  </div>
);
