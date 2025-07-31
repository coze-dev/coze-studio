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

import { Typography, UIIconButton } from '@coze-arch/bot-semi';
import { IconArrowLeft } from '@coze-arch/bot-icons';
import { LoadingButton } from '@coze-common/loading-button';
import { I18n } from '@coze-arch/i18n';

import { useMerge } from '../use-merge';

import styles from './title-bar.module.less';

const TitleBar = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void;
  onOk: () => Promise<void>;
}) => {
  const { loading, data, retainedResult, handleMerge } = useMerge();

  const mergeable =
    !loading &&
    data.reduce(
      (able, item) => able && !(item.isConflict && !retainedResult[item.key]),
      true,
    );

  return (
    <div className={styles['title-container']}>
      <UIIconButton
        className={styles['exit-btn']}
        icon={<IconArrowLeft />}
        type="tertiary"
        onClick={onCancel}
      ></UIIconButton>

      <Typography.Text className={styles['title-text']}>
        {I18n.t('workflow_publish_multibranch_merge')}
      </Typography.Text>

      <LoadingButton
        className={styles['merge-button']}
        theme="solid"
        type="primary"
        onClick={async () => {
          const merged = await handleMerge();
          if (merged) {
            await onOk();
          }
        }}
        disabled={!mergeable}
      >
        {I18n.t('workflow_publish_multibranch_merge_to_draft')}
      </LoadingButton>
    </div>
  );
};

export default TitleBar;
