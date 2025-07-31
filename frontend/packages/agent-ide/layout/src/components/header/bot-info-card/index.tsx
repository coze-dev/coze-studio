/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPeopleFill,
  IconCozTeamFill,
  IconCozCheckMarkCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import {
  Avatar,
  Typography,
  Tag,
  Popover,
  IconButton,
} from '@coze-arch/coze-design';
import { formatDate } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { IconEditNew } from '@coze-arch/bot-icons';
import { SpaceType } from '@coze-arch/bot-api/developer_api';

import { BotPublishStatus } from '../bot-publish-status';

const BotInfoCardContent = ({ deployButton }: { deployButton: ReactNode }) => {
  const { botInfo } = useBotInfoStore(
    useShallow(state => ({
      botInfo: state,
    })),
  );
  const {
    space: { name: spaceName, space_type: spaceType },
  } = useSpaceStore();
  const isPersonal = spaceType === SpaceType.Personal;
  return (
    <div className="w-[260px] p-4 coz-bg-max">
      <div className="flex items-center justify-center mb-7">
        <Avatar size="medium" src={botInfo.icon_url} />
      </div>
      <div className="flex items-center justify-center gap-2 flex-col">
        <Typography.Text strong className="!text-xxl !font-medium">
          {botInfo.name}
        </Typography.Text>

        <div className="flex items-cente">
          <Tag
            color="primary"
            className="max-w-[160px] !bg-transparent !coz-fg-secondary !p-0"
            prefixIcon={
              isPersonal ? <IconCozPeopleFill /> : <IconCozTeamFill />
            }
          >
            {spaceName}
          </Tag>
          <BotPublishStatus deployButton={deployButton} />
        </div>

        {botInfo.description ? (
          <Typography.Paragraph
            className="text-sm coz-fg-primary"
            ellipsis={{ rows: 2 }}
          >
            {botInfo.description}
          </Typography.Paragraph>
        ) : null}
        <div className="text-xs coz-fg-secondary">
          {I18n.t('Create_time')}:{' '}
          {botInfo.create_time ? formatDate(Number(botInfo.create_time)) : null}
        </div>
      </div>
    </div>
  );
};

interface BotInfoCardProps {
  isReadonly: boolean;
  editBotInfoFn: () => void;
  deployButton: ReactNode;
}

export const BotInfoCard = ({
  isReadonly,
  editBotInfoFn,
  deployButton,
}: BotInfoCardProps) => {
  const { botInfo, noPublish } = useBotInfoStore(
    useShallow(state => ({
      botInfo: state,
      noPublish: !state.has_publish,
    })),
  );

  const triggerContent = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar
          size="small"
          shape="square"
          src={botInfo?.icon_url}
          className="rounded"
        ></Avatar>
        {!noPublish ? (
          <div className="absolute flex justify-center items-center -right-[1px] -bottom-[1px] w-3 h-3 text-[12px] coz-bg-max box-content border-[1.5px] border-solid rounded-small border-[#fff]">
            <IconCozCheckMarkCircleFillPalette className="relative coz-fg-hglt-green" />
          </div>
        ) : null}
      </div>
      <Typography.Title className="!text-[16px] !coz-fg-plus !font-medium !leading-[22px]">
        {botInfo?.name}
      </Typography.Title>
      {!isReadonly && (
        <IconButton
          className="edit-btn"
          color="secondary"
          icon={<IconEditNew />}
          theme="borderless"
          onClick={() => {
            editBotInfoFn();
          }}
          data-testid="bot.ide.bot_creator.bot-info-edit-create-edit-info-button"
        />
      )}
    </div>
  );

  return (
    <Popover
      content={<BotInfoCardContent deployButton={deployButton} />}
      trigger="hover"
      position="bottomLeft"
    >
      {triggerContent}
    </Popover>
  );
};
