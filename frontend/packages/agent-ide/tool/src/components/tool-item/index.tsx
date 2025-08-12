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

/* eslint-disable react-hooks/rules-of-hooks */
import { type ReactNode, useRef, type FC } from 'react';

import classNames from 'classnames';
import { useHover } from 'ahooks';
import { Divider } from '@coze-arch/coze-design';

import { ToolTooltip } from '../tool-tooltip';
import {
  ToolItemContextProvider,
  useToolItemContext,
} from '../../context/tool-item-context';

import s from './index.module.less';

interface ToolItemProps {
  /**
   * title
   */
  title: string;
  /**
   * describe
   */
  description: string;
  /**
   * tags
   */
  tags?: ReactNode;
  /**
   * avatar
   */
  avatar: string;
  /**
   * Actions area
   */
  actions?: ReactNode;
  /**
   * Icon display area
   */
  icons?: ReactNode;
  /**
   * disabled state
   */
  disabled?: boolean;
  /**
   * tooltips
   */
  tooltips?: ReactNode;
  /**
   * Click on the card's callback
   */
  onClick?: () => void;

  //  Size - Fits large cards in workflow-as-agent mode
  size?: 'default' | 'large';

  avatarStyle?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _ToolItem: FC<ToolItemProps> = ({
  title,
  description,
  avatar,
  actions,
  icons,
  onClick,
  tooltips,
  tags,
  disabled,
  size = 'default',
  avatarStyle,
}) => {
  const containerRef = useRef(null);
  const isHovering = useHover(containerRef);

  const { isForceShowAction } = useToolItemContext();

  const isShowAction = isHovering || isForceShowAction;

  return (
    <ToolTooltip content={tooltips} position="top">
      <div
        data-testid={'bot.editor.tool.added-tool'}
        ref={containerRef}
        className={classNames(
          'w-full flex flex-row items-center coz-bg-max rounded-[8px]',
          {
            default: 'min-h-[56px] px-[8px] py-[10px]',
            large: 'min-h-[102px] px-[24px] py-[16px]',
          }[size],
          {
            '!coz-mg-secondary-hovered': isHovering,
            'cursor-pointer': Boolean(onClick),
            'cursor-default': !onClick,
            'cursor-not-allowed': disabled,
          },
        )}
        onClick={onClick}
      >
        <div
          className={classNames(
            'flex flex-row flex-1 min-w-[0px] justify-center items-center',
            {
              'opacity-30': disabled,
            },
          )}
        >
          {avatar ? (
            <img
              src={avatar}
              style={avatarStyle}
              className={classNames(
                {
                  default: 'w-[36px] h-[36px] rounded-[5px]',
                  large: 'w-[48px] h-[48px] rounded-[6px]',
                }[size],
                'overflow-hidden',
              )}
            />
          ) : null}
          <div
            className={classNames(
              {
                default: 'ml-[8px]',
                large: 'ml-[12px]',
              }[size],
              'flex flex-col flex-1 min-w-[0px] w-0',
            )}
          >
            <div className="flex flex-row items-center overflow-hidden">
              <p
                className={classNames(
                  {
                    default: 'text-[14px] leading-[20px]',
                    large: 'text-[20px] leading-[28px]',
                  }[size],
                  'coz-fg-primary truncate flex-1 font-medium',
                )}
              >
                {title}
              </p>
              {!isShowAction || disabled ? (
                <div className="justify-self-end grid grid-flow-col gap-x-[2px]">
                  {icons}
                </div>
              ) : null}
            </div>
            <p
              className={classNames(
                {
                  default: 'text-[12px] leading-[16px] truncate',
                  large:
                    'text-[14px] leading-[20px] mt-[2px] text-clip line-clamp-2',
                }[size],
                'coz-fg-secondary',
              )}
            >
              {tags ? (
                <>
                  {tags}
                  <Divider layout="vertical" margin="4px" className="h-[9px]" />
                </>
              ) : null}
              {description}
            </p>
          </div>
        </div>
        <div
          className={classNames(
            {
              default: 'grid grid-flow-col gap-x-[2px]',
              large: 'flex gap-[4px] ml-[12px]',
            }[size],
            size === 'large' && s['actions-large'],
            {
              hidden: !isShowAction,
              'opacity-30': disabled,
            },
          )}
          onClick={e => e.stopPropagation()}
        >
          {actions}
        </div>
      </div>
    </ToolTooltip>
  );
};

export const ToolItem: FC<ToolItemProps> = props => (
  <ToolItemContextProvider>
    <_ToolItem {...props} />
  </ToolItemContextProvider>
);
