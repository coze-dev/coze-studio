import React from 'react';

import { INTENT_NODE_MODE } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { INTENT_MODE } from '@/node-registries/intent/constants';
import { RadioSetterField } from '@/node-registries/common/fields';
export default function ModeRadio() {
  // The community version does not support the fast mode of intent recognition for future expansion
  if (IS_OPEN_SOURCE) {
    return null;
  }

  return (
    <RadioSetterField
      required
      name={INTENT_MODE}
      defaultValue={INTENT_NODE_MODE.MINIMAL}
      options={{
        key: 'questionParams.answer_type',
        options: [
          {
            label: I18n.t('workflow_250117_03'),
            value: INTENT_NODE_MODE.MINIMAL,
          },
          {
            label: I18n.t('workflow_250117_04'),
            value: INTENT_NODE_MODE.STANDARD,
          },
        ],
      }}
    />
  );
}
