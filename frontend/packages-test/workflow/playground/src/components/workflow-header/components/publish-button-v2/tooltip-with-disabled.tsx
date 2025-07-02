import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';

type TooltipWithDisabledProps = TooltipProps & {
  disabled?: boolean;
};

export const TooltipWithDisabled: React.FC<
  React.PropsWithChildren<TooltipWithDisabledProps>
> = ({ children, disabled, ...props }) => {
  if (disabled) {
    return <>{children}</>;
  }
  return <Tooltip {...props}>{children}</Tooltip>;
};
