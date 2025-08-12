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
  type FC,
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';

import { omit } from 'lodash-es';
import {
  Button,
  type ButtonProps,
  IconButton,
  Tooltip,
} from '@coze-arch/coze-design';

import { CollapsibleIconButtonContext, useWrapper, useItem } from './context';

/** Can make all the CollapsibleIconButton in the Group automatically expand according to the free width (expose the copy) and put away (hide the copy and only the icon is left) */
export const CollapsibleIconButtonGroup: FC<
  PropsWithChildren<{
    /** @default 12 */
    gap?: number;
  }>
> = ({ children, gap = 12 }) => {
  const wrapperDomRef = useRef<HTMLDivElement>(null);

  const contextValue = useWrapper(wrapperDomRef, gap);
  return (
    <div
      ref={wrapperDomRef}
      className="flex items-center justify-end flex-1 overflow-hidden"
      style={{ gap }}
    >
      <CollapsibleIconButtonContext.Provider value={contextValue}>
        {children}
      </CollapsibleIconButtonContext.Provider>
    </div>
  );
};

export const CollapsibleIconButton = forwardRef<
  HTMLSpanElement,
  {
    itemKey: symbol;
    text: string;
  } & ButtonProps
>(({ itemKey, text, ...rest }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const showText = useItem(itemKey, contentRef);

  return (
    <span ref={ref}>
      {/* Render to the outside of the screen when not visible for width */}
      <div className={showText ? '' : 'fixed left-[-999px]'} ref={contentRef}>
        <Button
          size="default"
          color="secondary"
          // Invisible without testid to avoid impact on E2E
          {...(showText ? rest : omit(rest, 'data-testid'))}
        >
          {text}
        </Button>
      </div>
      {!showText && (
        <Tooltip content={text}>
          <IconButton size="default" color="secondary" {...rest} />
        </Tooltip>
      )}
    </span>
  );
});

/** A more general version */
export const Collapsible = forwardRef<
  HTMLSpanElement,
  {
    itemKey: symbol;
    collapsedContent: ReactNode;
    fullContent: ReactNode;
    collapsedTooltip?: ReactNode;
  }
>(({ itemKey, fullContent, collapsedContent, collapsedTooltip }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const showFull = useItem(itemKey, contentRef);

  return (
    <span ref={ref}>
      {/* Render to the outside of the screen when not visible for width */}
      <div className={showFull ? '' : 'fixed left-[-999px]'} ref={contentRef}>
        {fullContent}
      </div>
      {!showFull && (
        <Tooltip
          trigger={collapsedTooltip ? 'hover' : 'custom'}
          content={collapsedTooltip}
        >
          <span>{collapsedContent}</span>
        </Tooltip>
      )}
    </span>
  );
});

/** Elements that do not collapse, but participate in width calculations */
export function PlaceholderContainer({
  itemKey,
  children,
}: PropsWithChildren<{ itemKey: symbol }>) {
  const ref = useRef<HTMLSpanElement>(null);
  useItem(itemKey, ref);

  return <span ref={ref}>{children}</span>;
}
