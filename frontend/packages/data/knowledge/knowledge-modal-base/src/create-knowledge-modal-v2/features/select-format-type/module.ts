import type React from 'react';

import type { FormatType } from '@coze-arch/bot-api/memory';
import type { CommonFieldProps } from '@coze/coze-design';

export interface SelectFormatTypeModuleProps {
  onChange: (type: FormatType) => void;
}

export type SelectFormatTypeModule = React.ComponentType<
  SelectFormatTypeModuleProps & Omit<CommonFieldProps, 'change'>
>;
