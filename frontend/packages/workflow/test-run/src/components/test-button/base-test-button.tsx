import { IconCozPlayFill } from '@coze-arch/coze-design/icons';
import { Button, type ButtonProps } from '@coze-arch/coze-design';

export const BaseTestButton: React.FC<ButtonProps> = props => (
  <Button color="green" icon={<IconCozPlayFill />} {...props} />
);
