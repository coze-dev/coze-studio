import { ModelStyle } from '@coze-arch/bot-api/developer_api';
import { type ModelPresetValues } from '@coze-agent-ide/bot-editor-context-store';

import { primitiveExhaustiveCheck } from '../exhaustive-check';

export const getDiversityPresetValueByStyle = (
  style: ModelStyle,
  presetValues: ModelPresetValues,
) => {
  if (style === ModelStyle.Balance) {
    return presetValues.balance;
  }
  if (style === ModelStyle.Creative) {
    return presetValues.creative;
  }
  if (style === ModelStyle.Precise) {
    return presetValues.precise;
  }
  if (style === ModelStyle.Custom) {
    return;
  }
  primitiveExhaustiveCheck(style);
};
