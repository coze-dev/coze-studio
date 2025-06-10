import {
  type PropsWithChildren,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';

import {
  FormCard,
  type ContentRef,
} from '@/form-extensions/components/form-card';

import { FieldEmpty } from './field-empty';

export interface SectionProps {
  title?: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipClassName?: string;
  actions?: React.ReactNode[];
  isEmpty?: boolean;
  emptyText?: string;
  collapsible?: boolean;
  noPadding?: boolean;
  headerClassName?: string;
  testId?: string;
}

/**
 * 表单分组
 */
export const Section = forwardRef(
  (
    {
      title,
      tooltip,
      tooltipClassName,
      actions,
      children,
      isEmpty = false,
      emptyText,
      collapsible,
      noPadding,
      headerClassName,
      testId,
    }: PropsWithChildren<SectionProps>,
    ref,
  ) => {
    const formCardRef = useRef<ContentRef>(null);

    useImperativeHandle(ref, () => ({
      open: () => formCardRef?.current?.setOpen?.(true),
      close: () => formCardRef?.current?.setOpen?.(false),
    }));

    return (
      <FormCard
        header={title}
        tooltip={tooltip}
        tooltipClassName={tooltipClassName}
        onRef={formCardRef}
        collapsible={collapsible}
        noPadding={noPadding}
        testId={testId}
        headerClassName={headerClassName}
        actionButton={
          <div className="flex gap-[8px] items-center">{actions}</div>
        }
      >
        <FieldEmpty isEmpty={isEmpty} text={emptyText}>
          {children}
        </FieldEmpty>
      </FormCard>
    );
  },
);
