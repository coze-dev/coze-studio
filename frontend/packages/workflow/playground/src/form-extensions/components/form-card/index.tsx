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

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

import classNames from 'classnames';
import { type WorkflowPortType } from '@flowgram-adapter/free-layout-editor';
import { EmptyFunction } from '@coze-workflow/base/constants';
import { useNodeTestId } from '@coze-workflow/base';
import {
  IconCozArrowDownFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Collapsible, Image } from '@coze-arch/coze-design';

import {
  FormItemFeedback,
  type FormItemErrorProps,
} from '../form-item-feedback';
import createSlots from '../../../utils/create-slots';
import AutoSizeTooltip from '../../../ui-components/auto-size-tooltip';

import s from './index.module.less';

export interface FormCardProps {
  header?: ReactNode;
  icon?: string;
  actionButton?: ReactNode;
  actionButtonStyle?: CSSProperties;
  tooltip?: string | ReactNode;
  tooltipContent?: ReactNode;
  tooltipClassName?: string;
  maxContentHeight?: number;
  showBottomBorder?: boolean;
  showBorderTopRadius?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  style?: CSSProperties;
  collapsible?: boolean;
  defaultExpand?: boolean;
  expand?: boolean;
  onExpandChange?: (expand: boolean) => void;
  autoExpandWhenDomChange?: boolean;
  onRef?: ForwardedRef<ContentRef>;
  noPadding?: boolean;
  feedbackText?: FormItemErrorProps['feedbackText'];
  feedbackStatus?: FormItemErrorProps['feedbackStatus'];
  disableFeedback?: boolean;
  portInfo?: { portID: string; portType: WorkflowPortType }; // point
  testId?: string;
  motion?: boolean;
  required?: boolean;
  hidden?: boolean;
  headerStyle?: CSSProperties;
}

export interface ContentRef {
  setOpen?: (isOpen: boolean) => void;
}

/** Customize the action button class name to determine whether the click event triggers the collapse */
const CUSTOM_ACTION_BUTTON_CLASS = 'custom-action-button';

const { Slots, Slot } = createSlots(['Action']);

const Action: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Slot name="Action">{children}</Slot>
);

const FormCard: React.FC<PropsWithChildren<FormCardProps>> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Action: React.FC<React.PropsWithChildren>;
} = ({
  children,
  icon,
  header,
  actionButton,
  actionButtonStyle,
  maxContentHeight,
  tooltip,
  tooltipClassName,
  className,
  contentClassName,
  headerClassName,
  style,
  collapsible = true,
  defaultExpand = true,
  autoExpandWhenDomChange,
  onRef,
  noPadding = false,
  feedbackText,
  feedbackStatus,
  disableFeedback = false,
  expand,
  motion,
  required,
  hidden,
  headerStyle,
  testId,
}) => {
  const [isOpen, setIsOpen] = useState(expand ?? defaultExpand);
  const childNodeRef = useRef<HTMLDivElement>(null);

  const { getNodeSetterId, concatTestId } = useNodeTestId();

  const setterTestId = concatTestId(testId || getNodeSetterId(''), 'form-card');

  const childNode = (
    <div
      ref={childNodeRef}
      style={{ maxHeight: maxContentHeight ? maxContentHeight : 'unset' }}
    >
      {children}
    </div>
  );

  useEffect(() => {
    if (typeof expand !== 'undefined') {
      setIsOpen(expand);
    }
  }, [expand]);

  useEffect(() => {
    const target = childNodeRef.current;
    if (autoExpandWhenDomChange && target) {
      const config = { attributes: true, childList: true, subtree: true };
      // Only when the dom change auto-unfold function is turned on
      const callback: MutationCallback = mutationList => {
        if (mutationList.length > 0 && !isOpen) {
          // When the dom changes and is not turned on, it will automatically turn on
          setIsOpen(!isOpen);
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(target, config);

      return () => {
        observer.disconnect();
      };
    }
    return EmptyFunction;
  }, [isOpen]);

  useImperativeHandle(onRef, () => ({
    setOpen,
  }));

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const setOpen = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  return (
    <Slots>
      {slots => (
        <div
          className={classNames(className, s['content-block'], {
            [s['no-padding']]: noPadding,
            hidden,
          })}
          style={style}
        >
          <header
            className={classNames(s['header-content'], headerClassName, {
              [s['header-has-content']]: isOpen
                ? collapsible || icon || header || tooltip
                : false,
              [s['header-is-closed']]: !isOpen,
              'cursor-pointer': collapsible,
            })}
            style={headerStyle}
            onClick={e => {
              if (!collapsible) {
                return;
              }
              // Region checks whether the click event comes from the action button and does not collapse the click button event
              // Q: Why not directly in the operation button stopPropagation?
              // A: In order not to hinder the top-level capture card click event, it is used to put the card on the top
              let el = e.target as HTMLElement;
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers
              for (let i = 0; i <= 8; i++) {
                if (el.classList.contains(CUSTOM_ACTION_BUTTON_CLASS)) {
                  return;
                }
                if (!el.parentElement) {
                  break;
                }
                el = el.parentElement;
              }
              // endregion
              setIsOpen(!isOpen);
            }}
          >
            <div
              className={s.header}
              data-testid={concatTestId(setterTestId, 'title')}
            >
              {collapsible ? (
                <div
                  className={classNames(
                    collapsible ? 'cursor-pointer' : 'cursor-default',
                    {
                      [s['header-icon-arrow']]: true,
                      [s.open]: isOpen,
                    },
                  )}
                  data-testid={concatTestId(setterTestId, 'arrow')}
                >
                  <IconCozArrowDownFill className="coz-fg-secondary" />
                </div>
              ) : null}
              {icon ? (
                <Image
                  preview={false}
                  className={s['header-icon']}
                  src={icon}
                />
              ) : null}
              {header ? (
                <div className={s.label}>
                  {header}
                  {required ? (
                    <span className="ml-[2px] text-[#FF441E]">*</span>
                  ) : null}
                </div>
              ) : null}
              {tooltip ? (
                <AutoSizeTooltip
                  showArrow
                  position="top"
                  className={s.popover}
                  content={
                    <span
                      data-testid={concatTestId(
                        setterTestId,
                        'tooltip-content',
                      )}
                    >
                      {tooltip}
                    </span>
                  }
                  tooltipClassName={tooltipClassName}
                >
                  <IconCozInfoCircle
                    data-testid={concatTestId(
                      setterTestId,
                      'tooltip-icon-info',
                    )}
                    className="text-lg coz-fg-secondary"
                  />
                </AutoSizeTooltip>
              ) : null}
            </div>
            <div
              className={CUSTOM_ACTION_BUTTON_CLASS}
              style={{ ...(actionButtonStyle || {}) }}
            >
              {slots.Action || actionButton}
            </div>
          </header>
          <div
            className={classNames({
              [s['overflow-content']]: true,
              [contentClassName || '']: Boolean(contentClassName),
              [s.open]: isOpen,
            })}
          >
            <Collapsible keepDOM fade isOpen={isOpen} motion={motion}>
              {childNode}
            </Collapsible>
          </div>
          {!disableFeedback && (
            <FormItemFeedback
              feedbackText={feedbackText}
              feedbackStatus={feedbackStatus}
            />
          )}
        </div>
      )}
    </Slots>
  );
};

FormCard.Action = Action;

export { FormCard };
