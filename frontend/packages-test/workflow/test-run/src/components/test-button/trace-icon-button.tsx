import { I18n } from '@coze-arch/i18n';
import { IconCozDebug } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip, type ButtonProps } from '@coze-arch/coze-design';

type TraceIconButtonProps = ButtonProps;

export const TraceIconButton: React.FC<TraceIconButtonProps> = props => (
  <Tooltip content={I18n.t('debug_btn')}>
    <IconButton
      icon={<IconCozDebug className="coz-fg-primary" />}
      color="secondary"
      {...props}
    />
  </Tooltip>
);
