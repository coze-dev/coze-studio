import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

interface IconRemoveProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
}

export function IconRemove({
  className = '',
  onClick,
  disabled = false,
  testId = '',
}: IconRemoveProps) {
  return (
    <IconButton
      className={`${className} !block`}
      icon={<IconCozMinus />}
      color="secondary"
      onClick={onClick}
      disabled={disabled}
      size="small"
      data-testid={testId}
    />
  );
}
