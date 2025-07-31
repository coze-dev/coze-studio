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

import copy from 'copy-to-clipboard';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { Typography, Toast } from '@coze-arch/coze-design';
import { UIIconButton } from '@coze-arch/bot-semi';

import { useExecStateEntity } from '../../../hooks';

const { Text } = Typography;

export const ExecuteLogId = () => {
  const execEntity = useExecStateEntity();

  const { executeLogId = '', logID = '' } = execEntity;

  const handleCopy = (id: string) => {
    const success = copy(id);
    if (success) {
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
    } else {
      Toast.warning({ content: I18n.t('copy_failed'), showClose: false });
    }
  };

  if (!executeLogId) {
    return null;
  }

  return (
    <>
      <div>
        <Text className="inline break-words" size="small" type="quaternary">
          {`${I18n.t(
            'workflow_running_results_error_executeid',
          )}: ${executeLogId}`}
          <UIIconButton
            wrapperClass="inline"
            iconSize="small"
            icon={<IconCozCopy color="#1D1C2359" />}
            onClick={() => handleCopy(executeLogId)}
          />
        </Text>
      </div>

      <div>
        <Text className="inline break-words" size="small" type="quaternary">
          {`logID: ${logID}`}
          <UIIconButton
            wrapperClass="inline"
            iconSize="small"
            icon={<IconCozCopy color="#1D1C2359" />}
            onClick={() => handleCopy(logID)}
          />
        </Text>
      </div>
    </>
  );
};
