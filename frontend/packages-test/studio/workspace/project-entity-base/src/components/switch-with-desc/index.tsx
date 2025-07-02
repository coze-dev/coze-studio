import cls from 'classnames';
import { Switch, type SwitchProps } from '@coze-arch/coze-design';

export function SwitchWithDesc({
  value,
  onChange,
  className,
  desc,
  descClassName,
  switchClassName,
  ...rest
}: Omit<SwitchProps, 'checked'> & {
  value?: boolean;
  desc: string;
  descClassName?: string;
  switchClassName?: string;
}) {
  return (
    <div className={cls('flex items-center justify-between', className)}>
      <span className={cls('coz-fg-primary', descClassName)}>{desc}</span>
      <Switch
        size="small"
        {...rest}
        checked={value}
        onChange={onChange}
        className={cls('shrink-0', switchClassName)}
      />
    </div>
  );
}
