import { type PropsWithChildren } from 'react';

import cls from 'classnames';
import {
  IconCozStarFill,
  IconCozQuestionMarkCircle,
} from '@coze-arch/coze-design/icons';
import { Avatar, Divider, Tooltip } from '@coze-arch/coze-design';

export type ModelOptionGroupProps =
  | {
      /** 新模型专区 */
      type: 'new';
      name: string;
      tips?: string;
    }
  | {
      /** 普通系列模型 */
      type?: 'normal';
      icon: string;
      name: string;
      desc: string;
      tips?: string;
    };

export function ModelOptionGroup({
  children,
  ...props
}: PropsWithChildren<ModelOptionGroupProps>) {
  return (
    <section>
      <div className="pt-[12px] pl-[16px] pb-[2px]">
        {props.type === 'new' ? (
          <div className="flex items-center gap-[4px] coz-fg-hglt">
            <IconCozStarFill />
            <span className="text-[12px] leading-[16px]">{props.name}</span>
            {props.tips ? (
              <Tooltip content={props.tips}>
                <IconCozQuestionMarkCircle className="cursor-pointer coz-fg-secondary" />
              </Tooltip>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-[6px]">
            <Avatar
              shape="square"
              className="w-[14px] h-[14px] rounded-[3px] !cursor-default border border-solid coz-stroke-primary"
              src={props.icon}
            />
            <div
              className={cls(
                'flex items-center gap-[4px]',
                'text-[12px] leading-[16px]',
              )}
            >
              <span className="coz-fg-secondary">{props.name}</span>
              {props.tips ? (
                <Tooltip content={props.tips}>
                  <IconCozQuestionMarkCircle className="cursor-pointer coz-fg-secondary" />
                </Tooltip>
              ) : null}
              <Divider layout="vertical" />
              <span className="coz-fg-dim">{props.desc}</span>
            </div>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
