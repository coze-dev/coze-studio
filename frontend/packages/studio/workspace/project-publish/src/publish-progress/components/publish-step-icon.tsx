import {
  IconCozCheckMarkCircle,
  IconCozClock,
  IconCozClockFill,
  IconCozCrossCircle,
  IconCozWarningCircle,
  type OriginIconProps,
} from '@coze/coze-design/icons';
import { type StepProps } from '@coze/coze-design';

export interface PublishStepIconProps {
  status: StepProps['status'] | 'warn';
}

export function PublishStepIcon({ status }: PublishStepIconProps) {
  const iconProps: Pick<OriginIconProps, 'width' | 'height'> = {
    width: '16px',
    height: '16px',
  };
  switch (status) {
    case 'wait':
      return <IconCozClock className="coz-fg-secondary" {...iconProps} />;
    case 'process':
      return <IconCozClockFill className="coz-fg-hglt" {...iconProps} />;
    case 'finish':
      return (
        <IconCozCheckMarkCircle className="coz-fg-hglt-green" {...iconProps} />
      );
    case 'warn':
      return (
        <IconCozWarningCircle className="coz-fg-hglt-yellow" {...iconProps} />
      );
    case 'error':
      return <IconCozCrossCircle className="coz-fg-hglt-red" {...iconProps} />;
    default:
      return null;
  }
}
