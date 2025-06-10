import { type PropsWithChildren, createContext } from 'react';

import { merge } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';

import { type CopywritingContextInterface } from './types';

const getDefaultCopywriting = (): CopywritingContextInterface => ({
  textareaPlaceholder: '',
  textareaBottomTips: '',
  clearContextDividerText: '',
  clearContextTooltipContent: '',
});

export const CopywritingContext = createContext<CopywritingContextInterface>(
  getDefaultCopywriting(),
);

export const CopywritingProvider = ({
  children,
  ...rest
}: PropsWithChildren<Partial<CopywritingContextInterface>>) => (
  <CopywritingContext.Provider
    value={merge(
      {},
      getDefaultCopywriting(),
      {
        clearContextDividerText: I18n.t('context_clear_finish'),
      },
      rest,
    )}
  >
    {children}
  </CopywritingContext.Provider>
);

CopywritingProvider.displayName = 'ChatAreaCopywritingProvider';
