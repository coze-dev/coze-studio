import { forwardRef, type Ref } from 'react';

import classnames from 'classnames';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { IconHandle } from '@douyinfe/semi-icons';

export const DragHandle = forwardRef<
  HTMLElement,
  WithCustomStyle<{
    testId?: string;
  }>
>(({ className, style, testId }, ref) => (
  <IconHandle
    ref={ref as Ref<HTMLSpanElement>}
    data-disable-node-drag
    className={classnames(
      'cursor-move text-[var(--semi-color-text-3)]',
      className,
    )}
    style={style}
    data-testid={testId}
  />
));
