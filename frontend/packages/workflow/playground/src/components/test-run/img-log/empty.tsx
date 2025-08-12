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

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Spin } from '@coze-arch/bot-semi';
import { NodeExeStatus } from '@coze-arch/bot-api/workflow_api';

import { useTestRunResult } from './use-test-run-result';
import waitIcon from './assets/wait.svg';
import runningIcon from './assets/running.svg';
import failIcon from './assets/fail.svg';

import styles from './empty.module.less';

export function Empty() {
  const testRunResult = useTestRunResult();
  let text: I18nKeysNoOptionsType = 'imageflow_output_display_desc1';
  let imageUrl = waitIcon;
  const isRunning = testRunResult?.nodeStatus === NodeExeStatus.Running;
  const isFail = testRunResult?.nodeStatus === NodeExeStatus.Fail;

  if (isRunning) {
    text = 'imageflow_output_display_desc2';
    imageUrl = runningIcon;
  }

  if (isFail) {
    text = 'imageflow_output_display_desc3';
    imageUrl = failIcon;
  }

  const image = <img className={styles.img} src={imageUrl} />;

  return (
    <div className={styles.container}>
      {isRunning ? (
        <Spin wrapperClassName={styles.spin} indicator={image} />
      ) : (
        image
      )}
      <span className={styles.text}>{I18n.t(text)}</span>
    </div>
  );
}
