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

import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { useShowBackGround } from '@coze-common/chat-area';
import { IconCozQuotation } from '@coze-arch/coze-design/icons';

import { typeSafeQuoteNodeColorVariants } from '../variants';

export const QuoteTopUI: FC<PropsWithChildren> = ({ children }) => {
  const showBackground = useShowBackGround();
  return (
    <div
      className={classNames(
        ['h-auto', 'py-4px'],
        'flex flex-row items-center select-none w-m-0',
      )}
    >
      <IconCozQuotation
        className={classNames(
          typeSafeQuoteNodeColorVariants({ showBackground }),
          'mr-[8px] shrink-0 w-[12px] h-[12px]',
        )}
      />
      <div
        className={classNames('flex-1 min-w-0 truncate text-[12px]', [
          'leading-[16px]',
          typeSafeQuoteNodeColorVariants({ showBackground }),
        ])}
      >
        {children}
      </div>
    </div>
  );
};
