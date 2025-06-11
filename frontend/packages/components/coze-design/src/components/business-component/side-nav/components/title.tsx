import { type FC } from 'react';

import { IconCozPlus } from '@/components/icon';
import { Button } from '@/components/button';

export interface TitleProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  text: string;
  showAddButton?: boolean;
  suffix?: React.ReactNode;
}
export const Title: FC<TitleProps> = props => {
  const { text, showAddButton = false, className, suffix, ...rest } = props;
  return (
    <div
      className={[
        'flex',
        'justify-between',
        'items-center',
        'text-foreground-2',
        'text-lg',
        className,
      ].join(' ')}
      {...rest}
    >
      <span className="px-[8px]">{text}</span>
      {suffix ? (
        suffix
      ) : showAddButton ? (
        <Button
          className="bg-transparent hover:bg-background-5 active:bg-background-6 text-foreground-2"
          size="small"
          icon={<IconCozPlus className="text-xxl" />}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
