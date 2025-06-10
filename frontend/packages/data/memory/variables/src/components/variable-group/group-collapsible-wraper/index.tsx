import { type FC, type PropsWithChildren, useState } from 'react';

import cls from 'classnames';
import { IconCozArrowRight } from '@coze/coze-design/icons';
import { Collapsible } from '@coze/coze-design';

import { type VariableGroup } from '@/store';

export const GroupCollapsibleWrapper: FC<
  PropsWithChildren<{
    groupInfo: VariableGroup;
    level?: number;
  }>
> = props => {
  const { groupInfo, children, level = 0 } = props;
  const [isOpen, setIsOpen] = useState(true);
  const isTopLevel = level === 0;
  return (
    <>
      <div
        className={cls(
          'flex w-full flex-col cursor-pointer px-1 py-2',
          isTopLevel ? 'hover:coz-mg-secondary-hovered hover:rounded-lg' : '',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="w-[22px] h-full flex items-center">
            <IconCozArrowRight
              className={cls('w-[14px] h-[14px]', isOpen ? 'rotate-90' : '')}
            />
          </div>
          <div className="w-[370px] h-full flex items-center">
            <div
              className={cls(
                'coz-stroke-primary text-xxl font-medium',
                !isTopLevel ? '!text-sm my-[10px]' : '',
              )}
            >
              {groupInfo.groupName}
            </div>
          </div>
        </div>
        {isTopLevel ? (
          <div className="text-sm coz-fg-secondary pl-[22px]">
            {groupInfo.groupDesc}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM isOpen={isOpen}>
        <div className={cls('w-full h-full', !isTopLevel ? 'pl-[18px]' : '')}>
          {children}
        </div>
      </Collapsible>
    </>
  );
};
