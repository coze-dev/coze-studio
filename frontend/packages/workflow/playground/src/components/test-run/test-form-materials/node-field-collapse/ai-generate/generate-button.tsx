/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { get, omit } from 'lodash-es';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { AIButton } from '@coze-arch/coze-design';

import { useAIGenerate } from './use-ai-generate';
import { GenerateModeSelect, GenerateMode } from './generate-mode-select';

import css from './generate-button.module.less';

interface AIGenerateButtonProps {
  schema: IFormSchema;
  onGenerate: (data: any, cover: boolean) => void;
  onGenStart: () => void;
  onGenEnd: () => void;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  schema,
  onGenerate,
  onGenStart,
  onGenEnd,
}) => {
  const handleGenerate = (data: any) => {
    const batch = get(data, TestFormFieldName.Batch);
    const setting = get(data, TestFormFieldName.Setting);
    const input = omit(data, [
      TestFormFieldName.Batch,
      TestFormFieldName.Setting,
    ]);
    onGenerate(
      {
        [TestFormFieldName.Node]: {
          [TestFormFieldName.Input]: input,
          [TestFormFieldName.Batch]: batch,
          [TestFormFieldName.Setting]: setting,
        },
      },
      GenerateMode.Cover === innerValue,
    );
  };

  const { generating, generate, abort } = useAIGenerate({
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
