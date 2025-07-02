import { IconButton } from '@coze-arch/coze-design';
import { IconSideFoldOutlined } from '@coze-arch/bot-icons';

import { useOpenGlobalLayoutSideSheet } from './global-layout/hooks';

// 用于在移动端模式开启侧边栏
export const SideSheetMenu = () => {
  const open = useOpenGlobalLayoutSideSheet();

  return (
    <IconButton
      color="secondary"
      icon={<IconSideFoldOutlined className="coz-fg-primary text-base" />}
      onClick={open}
    />
  );
};

export default SideSheetMenu;
