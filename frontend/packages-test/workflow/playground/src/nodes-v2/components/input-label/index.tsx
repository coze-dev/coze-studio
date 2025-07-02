import { type ReactNode, type CSSProperties } from 'react';

import classNames from 'classnames';
import { IconInfo } from '@coze-arch/bot-icons';

import AutoSizeTooltip from '@/ui-components/auto-size-tooltip';

export interface InputLabelProps {
  required?: boolean;
  hideRequiredTag?: boolean;
  label: ReactNode;
  tooltip?: ReactNode;
  tag?: ReactNode;
  className?: string;
  labelStyle?: CSSProperties;
  labelClassName?: string;
  tootipPopoverClassName?: string;
  tootipIconClassName?: string;
}

const InputLabel = ({
  required,
  hideRequiredTag = false,
  label,
  tooltip,
  tag,
  labelStyle = {
    fontSize: 12,
    marginRight: 0,
  },
  className,
  labelClassName,
  tootipPopoverClassName,
  tootipIconClassName,
}: InputLabelProps) => (
  <div className={classNames('flex mr-2 items-baseline', className)}>
    <div className="flex overflow-hidden">
      <AutoSizeTooltip
        content={label}
        showArrow
        position="top"
        className="flex-1 grow-1 truncate"
      >
        <span
          className={classNames('flex-1 grow-1 truncate', labelClassName)}
          style={labelStyle}
        >
          {label}
        </span>
      </AutoSizeTooltip>

      {required && !hideRequiredTag ? (
        <span
          style={{ color: 'var(--light-usage-danger-color-danger,#f93920)' }}
        >
          *
        </span>
      ) : null}
      {tooltip ? (
        <div className="ml-[4px] mt-[2px]">
          <AutoSizeTooltip
            showArrow
            position="top"
            className={tootipPopoverClassName}
            content={tooltip}
          >
            <IconInfo className={tootipIconClassName} />
          </AutoSizeTooltip>
        </div>
      ) : null}
    </div>
    {tag ? <div className="flex-1 shrink-0 grow-1">{tag}</div> : null}
  </div>
);

export default InputLabel;
