import { Tooltip, Typography } from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

export const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <div className="flex items-center">
    <Typography.Text
      className="mr-[8px]"
      ellipsis={{
        showTooltip: { opts: { content: label } },
      }}
      style={{ maxWidth: 160 }}
    >
      {label}
    </Typography.Text>
    <Tooltip content={tooltip}>
      <IconInfo style={{ color: 'rgba(167, 169, 176, 1)' }} />
    </Tooltip>
  </div>
);
