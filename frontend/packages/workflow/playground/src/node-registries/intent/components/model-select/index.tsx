import React from 'react';

import { INTENT_NODE_MODE } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { INTENT_MODE, MODEL } from '@/node-registries/intent/constants';
import { ModelSelectField } from '@/node-registries/common/fields';
import { useWatch } from '@/form';

export default function ModelSelect() {
  const intentMode = useWatch({ name: INTENT_MODE });
  const isShow = intentMode === INTENT_NODE_MODE.STANDARD;

  return (
    isShow && (
      <ModelSelectField
        required
        name={MODEL}
        title={I18n.t('workflow_detail_llm_model')}
      />
    )
  );
}
