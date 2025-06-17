import React, { type ReactNode } from 'react';

import { GlobalVariableKey } from '@coze-workflow/variable';
import {
  IconCozFolder,
  IconCozPeople,
  IconCozSetting,
} from '@coze-arch/coze-design/icons';

const GLOBAL_VAR_ICON_MAP: Record<string, ReactNode> = {
  [GlobalVariableKey.App]: <IconCozFolder />,
  [GlobalVariableKey.User]: <IconCozPeople />,
  [GlobalVariableKey.System]: <IconCozSetting />,
};

export default function GlobalVarIcon({ nodeId }: { nodeId: string }) {
  return <>{GLOBAL_VAR_ICON_MAP[nodeId]}</>;
}
