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

import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, AIButton } from '@coze-arch/coze-design';

import { useAutoGen } from './use-auto-gen';

import styles from './auto-gen-button.module.less';

interface AutoGenButtonProps {
  onGenerate: (data: any) => void;
}

export const AutoGenButton: React.FC<AutoGenButtonProps> = ({ onGenerate }) => {
  const { generate, abort, generating } = useAutoGen();

  const handleGenerate = useCallback(async () => {
    const data = await generate();
    if (data?.length) {
      onGenerate(data);
    }
  }, [onGenerate, generate]);

  return (
    <div className={styles['auto-gen']}>
      {generating ? (
        <Tooltip content={I18n.t('workflow_testset_stopgen')}>
          <AIButton
            icon={<IconCozStopCircle />}
            onlyIcon={true}
            onClick={abort}
            color="aiplus"
            size="small"
          />
        </Tooltip>
      ) : null}
      <AIButton
        loading={generating}
        onClick={handleGenerate}
        color="aiplus"
        size="small"
      >
        {generating
          ? I18n.t('workflow_testset_generating')
          : I18n.t('workflow_testset_aigenerate')}
      </AIButton>
    </div>
  );
};
