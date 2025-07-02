import classNames from 'classnames';
import { Typography } from '@coze-arch/coze-design';

const { Text } = Typography;

export const ReadonlyText = (props: { value: string; className?: string }) => {
  const { value, className } = props;
  return (
    <Text
      className={classNames(
        'w-full coz-fg-primary text-sm !font-medium',
        className,
      )}
      ellipsis
    >
      {value}
    </Text>
  );
};
