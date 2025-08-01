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

import { lazy, Suspense } from 'react';

import classNames from 'classnames';
import {
  Tag,
  Highlight,
  Typography,
  Avatar,
  type TagProps,
} from '@coze-arch/coze-design';
import { Popover } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { useFlags } from '@coze-arch/bot-flags';
import { type ModelDescGroup } from '@coze-arch/bot-api/developer_api';

const LazyModelDescription = lazy(async () => {
  const { ModelDescription } = await import('./model-description');
  return {
    default: ModelDescription,
  };
});
const ModelDescription = (props: {
  descriptionGroupList: ModelDescGroup[];
}) => (
  <Suspense>
    <LazyModelDescription {...props} />
  </Suspense>
);

export interface OptionItemTag {
  label: string;
  color?: TagProps['color'];
}
export interface OptionItemProps {
  tokenLimit: number | undefined;
  descriptionGroupList: ModelDescGroup[] | undefined;
  avatar: string | undefined;
  name: string | undefined;
  searchWords?: string[];
  endPointName?: string; // Access point name (available in the professional version)
  showEndPointName?: boolean;
  className?: string;
  /**
   * @deprecated
   * Originally, there would only be "limit" labels. After M-5395720900, there will be a large number of new labels to avoid compatibility problems. The product agrees to simply hide the label display first.
   */
  tags?: OptionItemTag[];
}

export const ModelOptionItem: React.FC<OptionItemProps> = ({
  avatar,
  descriptionGroupList,
  tokenLimit = 0,
  name,
  searchWords = [],
  endPointName,
  showEndPointName = false,
  className,
}) => {
  const [FLAGS] = useFlags();
  const tags: OptionItemTag[] = [];

  const shouldShowEndPoint = showEndPointName && endPointName;
  // Support soon, so stay tuned.
  const displayName = FLAGS['bot.studio.model_select_switch_end_point_name_pos']
    ? endPointName || name
    : name;

  // Support soon, so stay tuned.
  const displayEndPointName = FLAGS[
    'bot.studio.model_select_switch_end_point_name_pos'
  ]
    ? name
    : endPointName;

  return (
    <div
      className={classNames(
        'w-full px-[8px] flex justify-between overflow-hidden gap-[16px]',
        {
          'py-2': showEndPointName,
        },
        className,
        endPointName ? 'items-start' : 'items-center',
      )}
    >
      <div
        className="flex-1 flex items-center gap-[8px] overflow-hidden"
        data-testid="bot.ide.bot_creator.select_model_formitem"
      >
        <Avatar
          shape="square"
          src={avatar}
          className={classNames('shrink-0', {
            '!h-4 !w-4': !showEndPointName,
            '!h-8 !w-8': showEndPointName,
          })}
          data-testid="bot-detail.model-config-modal.model-avatar"
        />
        <div
          className={classNames('flex-1', {
            'items-center': showEndPointName && !endPointName,
          })}
        >
          <div className="flex items-center">
            <span
              className="inline-block truncate leading-[20px]"
              data-testid="bot-detail.model-config-modal.model-name"
            >
              <Highlight
                sourceString={displayName}
                searchWords={searchWords}
                highlightClassName="coz-fg-hglt-yellow bg-transparent"
              />
            </span>
            {descriptionGroupList?.length ? (
              <Popover
                trigger="hover"
                className="max-w-[224px] py-[8px] px-[12px]"
                content={
                  <ModelDescription
                    descriptionGroupList={descriptionGroupList}
                    data-testid="bot-detail.model-config-modal-model.description-popover"
                  />
                }
              >
                <IconInfo
                  data-testid="bot-detail.model-config-modal.model-info-button"
                  className="ml-[4px]"
                />
              </Popover>
            ) : null}
            <Tag
              prefixIcon={null}
              color="primary"
              className="shrink-0 !ml-[8px]"
              data-testid="bot-detail.model-config-modal.model-token-tag"
              size="mini"
            >
              {(tokenLimit / 1024).toFixed(0)}K
            </Tag>
          </div>
          {shouldShowEndPoint ? (
            <Typography.Text
              className="coz-fg-secondary text-[12px] leading-[16px]"
              ellipsis={{
                showTooltip: {
                  opts: {
                    content: displayEndPointName,
                  },
                },
              }}
            >
              <Highlight
                sourceString={displayEndPointName}
                searchWords={searchWords}
                highlightClassName="coz-fg-hglt-yellow bg-transparent"
                component="span"
              />
            </Typography.Text>
          ) : null}
        </div>
      </div>
      {tags?.length ? (
        <div
          className={classNames('flex shrink-0', {
            'pt-[2px]': shouldShowEndPoint,
          })}
        >
          {tags.map(tag => (
            <Tag color={tag.color} key={tag.label} size="mini">
              {tag.label}
            </Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
};
