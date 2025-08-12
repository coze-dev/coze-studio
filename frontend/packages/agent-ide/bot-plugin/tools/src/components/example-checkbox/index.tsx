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

import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Checkbox, Tooltip } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface ExampleCheckboxProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export const ExampleCheckbox: FC<ExampleCheckboxProps> = ({
  value,
  onValueChange,
}) => {
  const [showTip, setShowTip] = useState(false);
  // @ts-expect-error -- linter-disable-autofix
  const onChange = e => {
    onValueChange(e.target.checked);
    if (!e.target.checked) {
      setShowTip(false);
    }
  };

  return (
    <div className={styles.checkbox}>
      <div className={styles.content}>
        <Tooltip
          content={I18n.t('plugin_edit_tool_test_run_cancel_example')}
          visible={showTip}
          trigger="custom"
        >
          <Checkbox
            onChange={onChange}
            checked={value}
            onMouseEnter={() => value && setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          ></Checkbox>
        </Tooltip>

        <div className={styles.label}>
          {I18n.t('plugin_edit_tool_test_run_save_results_as_example')}
        </div>
      </div>

      <div className={styles.line}></div>
    </div>
  );
};
