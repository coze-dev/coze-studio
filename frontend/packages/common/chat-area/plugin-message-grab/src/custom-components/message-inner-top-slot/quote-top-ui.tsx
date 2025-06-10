import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { useShowBackGround } from '@coze-common/chat-area';
import { IconCozQuotation } from '@coze/coze-design/icons';

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
