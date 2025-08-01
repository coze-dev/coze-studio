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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { get, omit } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { AIButton } from '@coze-arch/coze-design';

import { type TestFormSchema } from '../../types';
import { FieldName } from '../../constants';
import { useAIGenerate } from './use-ai-generate';
import { GenerateModeSelect, GenerateMode } from './generate-mode-select';

import css from './generate-button.module.less';

interface AIGenerateButtonProps {
  schema?: TestFormSchema;
  /**
   * Flow: Flow
   * Node: Single Node
   */
  type: 'flow' | 'node';
  onGenerate: (data: any, cover: boolean) => void;
  onGenStart: () => void;
  onGenEnd: () => void;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  schema,
  type,
  onGenerate,
  onGenStart,
  onGenEnd,
}) => {
  const handleGenerate = (data: any) => {
    const batch = get(data, FieldName.Batch);
    const setting = get(data, FieldName.Setting);
    const input = omit(data, [FieldName.Batch, FieldName.Setting]);
    onGenerate(
      {
        [FieldName.Node]: {
          [FieldName.Input]: input,
          [FieldName.Batch]: batch,
          [FieldName.Setting]: setting,
        },
      },
      GenerateMode.Cover === innerValue,
    );
  };

  const { generating, generate, abort } = useAIGenerate({
    type,
    onGenerate: handleGenerate,
  });
  const [innerValue, setInnerValue] = useState(GenerateMode.Complete);

  const handleClickGen = async () => {
    if (!schema) {
      return;
    }
    onGenStart();
    await generate(schema);
    onGenEnd();
  };

  const hasNodeFields = (schema?.fields || []).find(
    i => i.name === FieldName.Node,
  );

  // will support soon
  if (IS_OPEN_SOURCE) {
    return null;
  }

  if (!hasNodeFields) {
    return null;
  }

  return (
    <div className={css['generate-button']}>
      {generating ? (
        <AIButton
          color="aihglt"
          size="small"
          className={css['first-button']}
          icon={<IconCozStopCircle />}
          onClick={abort}
        >
          {innerValue === GenerateMode.Complete
            ? I18n.t('wf_testrun_ai_button_complete_stop')
            : I18n.t('wf_testrun_ai_button_cover_stop')}
        </AIButton>
      ) : (
        <AIButton
          color="aihglt"
          size="small"
          className={css['first-button']}
          onClick={handleClickGen}
        >
          {innerValue === GenerateMode.Complete
            ? I18n.t('wf_testrun_ai_button_complete')
            : I18n.t('wf_testrun_ai_button_cover')}
        </AIButton>
      )}
      <GenerateModeSelect
        value={innerValue}
        disabled={generating}
        className={css['last-button']}
        onChange={setInnerValue}
      />
    </div>
  );
};
