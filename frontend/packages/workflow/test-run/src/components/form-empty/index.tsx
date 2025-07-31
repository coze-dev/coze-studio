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
import { Typography } from '@coze-arch/coze-design';

import styles from './input-form-empty.module.less';

export const InputFormEmpty = () => (
  <div className={styles['input-form-empty']}>
    <Typography.Text className={'text-[12px] coz-fg-dim'}>
      {I18n.t('workflow_testrun_input_form_empty')}
    </Typography.Text>
  </div>
);
