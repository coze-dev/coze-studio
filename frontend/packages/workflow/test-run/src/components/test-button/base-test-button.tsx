import { IconCozPlayFill } from '@coze/coze-design/icons';
import { Button, type ButtonProps } from '@coze/coze-design';

export const BaseTestButton: React.FC<ButtonProps> = props => (
  <Button color="green" icon={<IconCozPlayFill />} {...props} />
);
