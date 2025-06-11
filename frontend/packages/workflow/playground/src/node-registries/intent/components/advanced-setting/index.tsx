import React from 'react';

import { INTENT_NODE_MODE } from '@coze-workflow/nodes';
import type { InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  INTENT_MODE,
  SYSTEM_PROMPT,
  INPUT_PATH,
} from '@/node-registries/intent/constants';
import { ExpressionEditorField } from '@/node-registries/common/fields';
import { Section, useWatch } from '@/form';

import styles from './index.module.less';

export default function AdvancedSetting() {
  const intentMode = useWatch({ name: INTENT_MODE });
  const isShow = intentMode === INTENT_NODE_MODE.STANDARD;
  const inputParameters = useWatch<InputValueVO[]>(INPUT_PATH);

  return (
    isShow && (
      <Section
        title={I18n.t('workflow_LLM_node_sp_title')}
        tooltip={I18n.t('workflow_intent_advance_set_tooltips')}
      >
        <ExpressionEditorField
          className={'!p-[4px]'}
          required={false}
          name={SYSTEM_PROMPT}
          placeholder={I18n.t('workflow_intent_advance_set_placeholder')}
          inputParameters={inputParameters}
          testId={`/${SYSTEM_PROMPT.split('.').join('/')}`}
          containerClassName={styles['option-expression-editor']}
        />
      </Section>
    )
  );
}
