import { Menu } from '@coze/coze-design';

interface KnowledgeSourceMenuItemProps {
  value?: string;
  onClick?: (value: string) => void;
  title: string;
  icon?: React.ReactNode;
  testId?: string;
}

export const KnowledgeSourceMenuItem = (
  props: KnowledgeSourceMenuItemProps,
) => {
  const { title, icon, testId, value, onClick } = props;
  return (
    <Menu.Item
      key={value}
      icon={icon ?? null}
      onClick={() => {
        if (value && onClick) {
          onClick.call(this, value);
        }
      }}
      data-testid={testId}
    >
      {title}
    </Menu.Item>
  );
};
