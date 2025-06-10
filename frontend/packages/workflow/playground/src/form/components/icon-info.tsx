import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

interface IconInfoProps {
  tooltip: string | React.ReactNode;
}

export function IconInfo({ tooltip }: IconInfoProps) {
  return (
    <Tooltip content={tooltip}>
      <IconCozInfoCircle className="text-lg coz-fg-secondary" />
    </Tooltip>
  );
}
