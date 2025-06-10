import { forwardRef, type JSX } from 'react';

import { type RenderFullLabelProps } from '@douyinfe/semi-ui/lib/es/tree/interface';
import { TreeSelect as SemiTreeSelect } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozArrowDown } from '@/components/icon';

import { treeSelectVariant } from './tree-select-variant';
import { type TreeSelectProps } from './tree-select-types';

import './index.css';

export const TreeSelect = forwardRef<SemiTreeSelect, TreeSelectProps>(
  (props, ref): JSX.Element => {
    const { size, className, onlyLeafSelectable, ...restProps } = {
      ...props,
    };
    const cls = cn(treeSelectVariant(), className);

    // TODO: 暂不支持搜索等其他能力
    const renderFullLabel = ({
      className: labelClassName,
      onExpand,
      onClick,
      data,
      expandIcon,
      level,
    }: RenderFullLabelProps) => {
      const { label } = data;
      const isLeaf = !(data.children && data.children.length);
      return (
        <li
          className={labelClassName}
          role="treeitem"
          key={data.key}
          onClick={isLeaf ? onClick : onExpand}
        >
          <span className="semi-tree-option-indent">
            {Array.from({ length: level }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'semi-tree-option-indent-unit',
                  index !== 0 &&
                    index === level - 1 &&
                    'semi-tree-option-indent-end',
                )}
              ></span>
            ))}
          </span>
          {isLeaf ? (
            <span className="semi-tree-option-empty-icon"></span>
          ) : (
            <>
              <span className="semi-tree-option-indent"></span>
              {expandIcon}
            </>
          )}
          {label}
        </li>
      );
    };

    return (
      <SemiTreeSelect
        borderless={false}
        renderFullLabel={onlyLeafSelectable ? renderFullLabel : undefined}
        dropdownClassName="coz-tree-select-popover"
        size={size}
        ref={ref}
        className={cls}
        arrowIcon={<IconCozArrowDown className="fill-foreground-3 text-xxl" />}
        {...restProps}
      />
    );
  },
);
