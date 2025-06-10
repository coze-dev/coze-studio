import { type ReactNode } from 'react';

import { type IChatUploadCopywritingConfig } from './common';

export interface ISimpleFunctionContentCopywriting {
  using: string;
}

export type IChatInputCopywritingConfig = Partial<{
  tooltip: Partial<{
    sendButtonTooltipContent: ReactNode | string;
    clearHistoryButtonTooltipContent: ReactNode | string;
    clearContextButtonTooltipContent: ReactNode | string;
    moreButtonTooltipContent: ReactNode | string;
    audioButtonTooltipContent: ReactNode | string;
    keyboardButtonTooltipContent: ReactNode | string;
  }>;
  inputPlaceholder: string;
  uploadConfig: IChatUploadCopywritingConfig;
  bottomTips: string;
}>;
