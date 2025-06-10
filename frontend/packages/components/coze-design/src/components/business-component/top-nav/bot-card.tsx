import { useMemo, type FC } from 'react';

import { IconCozEdit } from '@/components/icon';
import { Button } from '@/components/button';
import { Avatar } from '@/components/avatar';

export interface BotCardProps {
  isCompact: boolean;
  name: string;
  footer?: React.ReactNode;
}

export const BotCard: FC<BotCardProps> = props => {
  const { isCompact, name, footer } = props;

  const botNameClassName = useMemo(() => {
    if (isCompact) {
      if (footer) {
        // 紧凑 + 有 footer
        return 'text-lg leading-[20px]';
      }
      // 紧凑 + 无 footer
      return 'text-[20px] leading-[28px]';
    }

    // 非紧凑 + 有 footer
    if (footer) {
      return 'text-[20px] leading-[28px]';
    }

    // 非紧凑 + 无 footer
    return 'text-[32px] leading-[44px]';
  }, [isCompact, !!footer]);

  return (
    <div className="flex gap-[12px] items-center">
      <div className="flex items-center">
        <Avatar
          alt="coze"
          size={isCompact ? 'small' : 'lg'}
          src="https://placehold.co/460x460"
        />
      </div>
      <div className={`flex flex-col ${isCompact ? 'gap-[2px]' : 'gap-[4px]'}`}>
        <div className="flex gap-[4px] items-center">
          <div className={`text-foreground-5 font-medium ${botNameClassName}`}>
            {name}
          </div>
          <Button
            size="small"
            className={[
              'bg-transparent',
              'hover:bg-background-5',
              'active:bg-background-6',
              'text-foreground-4',
              'hover:text-foreground-4',
              'active:text-foreground-4',
            ].join(' ')}
            icon={<IconCozEdit className="text-lg" />}
          />
        </div>
        {footer ? (
          <div className="pb-[4px] text-foreground-4">{footer}</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
