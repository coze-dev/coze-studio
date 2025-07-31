/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
