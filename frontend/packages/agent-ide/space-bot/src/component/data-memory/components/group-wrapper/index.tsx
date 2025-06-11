import { type PropsWithChildren, type ReactNode, useState } from 'react';

import cls from 'classnames';
import { IconCozArrowRight } from '@coze/coze-design/icons';
import { Collapsible } from '@coze/coze-design';

export const VariableGroupWrapper = (
  props: PropsWithChildren<{
    variableGroup: {
      key: string | ReactNode;
      description: string | ReactNode;
    };
    defaultOpen?: boolean; // 添加默认展开属性
    level?: number;
  }>,
) => {
  const { variableGroup, children, defaultOpen = true, level = 0 } = props;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isTopLevel = level === 0;
  return (
    <>
      <div
        className={cls(
          'flex w-full cursor-pointer flex-col px-1 py-2',
          isTopLevel && 'hover:coz-mg-secondary-hovered hover:rounded-lg ',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex w-full items-center">
          <div className="w-6 flex items-center">
            <IconCozArrowRight
              className={cls(
                'w-[14px] h-[14px] transition-all',
                isOpen ? 'rotate-90' : '',
              )}
            />
          </div>
          <div className="flex items-center">
            <div
              className={cls(
                'coz-stroke-primary text-xxl font-medium coz-fg-plus',
                {
                  '!text-sm my-[10px]': !isTopLevel,
                },
              )}
            >
              {variableGroup.key}
            </div>
          </div>
        </div>
        {isTopLevel ? (
          <div className="text-sm coz-fg-secondary pl-6">
            {variableGroup.description}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM isOpen={isOpen}>
        <div
          className={cls({
            'pl-3': !isTopLevel,
          })}
        >
          {children}
        </div>
      </Collapsible>
    </>
  );
};
