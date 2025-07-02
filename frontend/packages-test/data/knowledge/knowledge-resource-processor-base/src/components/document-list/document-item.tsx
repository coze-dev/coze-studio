import { type ReactNode } from 'react';

import cls from 'classnames';
import { Typography } from '@coze-arch/coze-design';

interface IDocumentItemProps {
  id: string;
  onClick: (id: string) => void;
  selected: boolean;
  title: string;
  status?: 'pending' | 'finished' | 'failed';
  addonAfter?: ReactNode;
}

export const DocumentItem: React.FC<IDocumentItemProps> = props => {
  const { id, onClick, title, selected, addonAfter } = props;

  return (
    <div
      className={cls(
        'w-full h-8 px-2 py-[6px] rounded-[8px] hover:coz-mg-primary cursor-pointer flex flex-nowrap',
        selected && 'coz-mg-primary',
      )}
      onClick={() => onClick(id)}
    >
      <Typography.Text
        className="w-full coz-fg-primary text-[14px] leading-[20px] grow truncate"
        ellipsis
      >
        {title}
      </Typography.Text>
      {addonAfter}
    </div>
  );
};

export default DocumentItem;
