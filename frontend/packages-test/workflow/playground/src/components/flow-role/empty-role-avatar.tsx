import { CozAvatar, type AvatarProps } from '@coze-arch/coze-design';

import img from './avatar.png';

interface EmptyRoleAvatarProps {
  size?: AvatarProps['size'];
  type?: AvatarProps['type'];
  width?: number;
  className?: string;
}

export const EmptyRoleAvatar: React.FC<EmptyRoleAvatarProps> = ({
  width,
  ...props
}) => <CozAvatar src={img} style={{ width, height: width }} {...props} />;
