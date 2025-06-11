import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { OutputsField } from '@/node-registries/common/fields';

export default function Outputs() {
  return (
    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_intent_output_tooltips')}
      id="intent-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  );
}
