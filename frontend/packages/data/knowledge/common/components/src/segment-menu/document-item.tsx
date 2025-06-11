import { type ReactNode } from 'react';

import cls from 'classnames';
import { Typography } from '@coze/coze-design';

export interface IDocumentItemProps {
  id: string;
  title: string;
  selected?: boolean;
  onClick?: (id: string) => void;
  label?: ReactNode;
  tag?: ReactNode;
}

const DocumentItem: React.FC<IDocumentItemProps> = props => {
  const { id, onClick, title, selected, tag, label } = props;

  return (
    <div
      className={cls(
        'w-full h-8 px-2 py-[6px] rounded-[8px] hover:coz-mg-primary cursor-pointer',
        'flex items-center',
        selected && 'coz-mg-primary',
      )}
      onClick={() => onClick?.(id)}
    >
      {label ? (
        <div className="w-full">{label}</div>
      ) : (
        <>
          <Typography.Text
            ellipsis={{ showTooltip: true }}
            className="w-full coz-fg-primary text-[14px] leading-[20px] grow truncate"
          >
            {title}
          </Typography.Text>
          <div className="flex items-center shrink-0">{tag}</div>
        </>
      )}
    </div>
  );
};

export default DocumentItem;
