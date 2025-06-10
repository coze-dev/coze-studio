import { CozAvatar } from '@coze/coze-design';

import { EmptyRoleAvatar } from '../empty-role-avatar';

import css from './role-avatar.module.less';

interface RoleAvatarProps {
  url?: string;
}

export const RoleAvatar: React.FC<RoleAvatarProps> = ({ url }) => {
  if (!url) {
    return <EmptyRoleAvatar size="small" className={css['role-avatar']} />;
  }
  return <CozAvatar src={url} className={css['role-avatar']} size="small" />;
};
