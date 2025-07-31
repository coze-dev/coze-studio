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
 * form grouping
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
