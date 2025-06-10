import React, { useMemo, type FC } from 'react';

import { Tag } from '@/components/tag';
import { IconCozArrowLeft, IconCozLoading } from '@/components/icon';
import { Button } from '@/components/button';

import { SideNavModal } from './nav-modal';
import { BotCard, type BotCardProps } from './bot-card';

interface TopNavProps {
  backType?: 'button' | 'breadcrumb';
  isCompact?: boolean;
  content?: React.ReactNode;
  botCardProps?: BotCardProps;
  highLightBorderBottom?: boolean;
}
export const TopNav: FC<TopNavProps> = props => {
  const {
    backType = 'button',
    isCompact = false,
    content = <></>,
    botCardProps = {},
    highLightBorderBottom = false,
  } = props;

  const botCard = useMemo(
    () => (
      <BotCard
        name={'Bot Gallery'}
        isCompact={isCompact}
        {...botCardProps}
        footer={
          <div className="flex gap-[8px]">
            <Tag
              size="mini"
              prefixIcon={<IconCozLoading className="text-[10px]" />}
            >
              Tagtag
            </Tag>
            <Tag
              size="mini"
              color="primary"
              prefixIcon={<IconCozLoading className="text-[10px]" />}
            >
              Tagtag
            </Tag>
            <div className="text-base">Auto-saved 17:06:34</div>
          </div>
        }
      />
    ),
    [botCardProps],
  );

  const backButton = useMemo(
    () => (
      <SideNavModal trigger="click">
        <Button
          className="bg--transparent hover:bg-background-5 active:bg-background-6 text-foreground-4 hover:text-foreground-4 active:text-foreground-4"
          icon={<IconCozArrowLeft className="text-xxl" />}
        />
      </SideNavModal>
    ),
    [],
  );

  const backBreadcrumb = useMemo(
    () => <div> Crumb / Crumb / Crumb / Crumb</div>,
    [],
  );

  const actions = useMemo(
    () => (
      <div className="text-foreground-4 flex gap-[8px] items-center">
        <div className="flex gap-[4px]">
          <div className="p-[8px]">
            <IconCozLoading className="text-xxl" />
          </div>
          <div className="p-[8px]">
            <IconCozLoading className="text-xxl" />
          </div>
        </div>

        <div className="w-[1px] h-[32px] bg-stroke"></div>
        <Button
          className="bg-background-4 hover:bg-background-5 active:bg-background-6 text-brand-6 hover:text-brand-6 active:text-brand-6"
          icon={<IconCozLoading className="text-xxl" />}
        >
          Button
        </Button>
        <Button icon={<IconCozLoading className="text-xxl" />}>Button</Button>
      </div>
    ),
    [],
  );

  const highLightClassName = useMemo(() => {
    if (highLightBorderBottom) {
      return 'border-b-stroke border-b';
    }
    return '';
  }, [highLightBorderBottom]);

  return (
    <div className={`w-full ${highLightClassName}`}>
      {isCompact ? (
        <div className="flex items-center p-[16px] gap-[12px]">
          {backButton}
          {botCard}
          <div className="flex-1">{content}</div>
          {actions}
        </div>
      ) : (
        <div className="flex flex-col gap-[44px] p-[24px]">
          <div className="flex items-center">
            {backType === 'button' ? backButton : backBreadcrumb}
            <div className="flex-1">{content}</div>
            {actions}
          </div>
          <div className="flex justify-center">
            <div className="w-[1024px]">{botCard}</div>
          </div>
        </div>
      )}
    </div>
  );
};
