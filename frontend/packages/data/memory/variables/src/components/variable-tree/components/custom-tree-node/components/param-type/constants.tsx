import { type ReactNode } from 'react';

import {
  IconCozNumber,
  IconCozNumberBracket,
  IconCozString,
  IconCozStringBracket,
  IconCozBoolean,
  IconCozBooleanBracket,
  IconCozBrace,
  IconCozBraceBracket,
} from '@coze/coze-design/icons';

import { ViewVariableType } from '@/store';

export const VARIABLE_TYPE_ICONS_MAP: Record<ViewVariableType, ReactNode> = {
  [ViewVariableType.String]: <IconCozString />,
  [ViewVariableType.Integer]: <IconCozNumber />,
  [ViewVariableType.Boolean]: <IconCozBoolean />,
  [ViewVariableType.Number]: <IconCozNumber />,
  [ViewVariableType.Object]: <IconCozBrace />,
  [ViewVariableType.ArrayString]: <IconCozStringBracket />,
  [ViewVariableType.ArrayInteger]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayBoolean]: <IconCozBooleanBracket />,
  [ViewVariableType.ArrayNumber]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayObject]: <IconCozBraceBracket />,
};
