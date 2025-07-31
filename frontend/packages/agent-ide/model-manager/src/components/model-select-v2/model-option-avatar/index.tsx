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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozRoleFill,
  IconCozLightbulbFill,
  IconCozChatFill,
  IconCozCodeFill,
  IconCozDocumentFill,
  IconCozImageFill,
  IconCozLightningFill,
  IconCozMusic,
  IconCozStarFill,
  IconCozVideoFill,
  IconCozWrenchFill,
} from '@coze-arch/coze-design/icons';
import { Avatar, Tooltip } from '@coze-arch/coze-design';
import { type Model, ModelTagValue } from '@coze-arch/bot-api/developer_api';

export function ModelOptionAvatar({ model }: { model: Model }) {
  return (
    <Tooltip
      trigger={
        model.model_status_details?.is_upcoming_deprecated ? 'hover' : 'custom'
      }
      content={I18n.t('model_list_model_deprecation_date', {
        date: model.model_status_details?.deprecated_date,
      })}
    >
      <span>
        <InnerImg
          model={model}
          bottomBanner={
            model.model_status_details?.is_upcoming_deprecated ? (
              <div
                className={cls(
                  'absolute bottom-0 left-0',
                  'w-full py-[1px] px-[3px] rounded-b-[6px]',
                  'flex items-center justify-center text-center',
                  'text-[10px] font-medium leading-[14px] break-all',
                  'coz-mg-mask coz-fg-hglt-plus',
                )}
              >
                {I18n.t('model_list_willDeprecated')}
              </div>
            ) : undefined
          }
        />
      </span>
    </Tooltip>
  );
}

function InnerImg({
  model: { model_status_details, model_icon },
  bottomBanner,
}: {
  model: Model;
  bottomBanner?: ReactNode;
}) {
  if (
    model_status_details?.is_new_model ||
    !model_status_details?.model_feature
  ) {
    return (
      <Avatar
        className="shrink-0 rounded-[6px] border border-solid coz-stroke-primary"
        shape="square"
        // @ts-expect-error -- there is a problem with the semi type definition
        bottomSlot={
          bottomBanner
            ? {
                render: () => bottomBanner,
              }
            : undefined
        }
        src={model_icon}
      />
    );
  }

  const featureIcon = FEATURE_ICON_MAP[model_status_details.model_feature];

  return (
    <div
      className={cls(
        'w-[48px] h-[48px] p-[13px] relative',
        'shrink-0 rounded-[6px] text-[22px]',
        featureIcon.color,
        featureIcon.bg,
      )}
    >
      {featureIcon.icon}
      {bottomBanner}
    </div>
  );
}

const FEATURE_ICON_MAP: Record<
  ModelTagValue,
  { color: string; bg: string; icon: ReactNode }
> = {
  [ModelTagValue.Flagship]: {
    icon: <IconCozStarFill />, //flagship
    color: 'coz-fg-color-brand',
    bg: 'coz-mg-hglt',
  },
  [ModelTagValue.HighSpeed]: {
    icon: <IconCozLightningFill />, //high speed
    color: 'coz-fg-color-blue',
    bg: 'coz-mg-color-blue',
  },
  [ModelTagValue.CostPerformance]: {
    icon: <IconCozChatFill />, //price/performance ratio
    color: 'coz-fg-color-blue',
    bg: 'coz-mg-color-blue',
  },
  [ModelTagValue.LongText]: {
    icon: <IconCozDocumentFill />, //long text
    color: 'coz-fg-color-blue',
    bg: 'coz-mg-color-blue',
  },
  [ModelTagValue.RolePlaying]: {
    icon: <IconCozRoleFill />, //Role Playing
    color: 'coz-fg-color-blue',
    bg: 'coz-mg-color-blue',
  },
  [ModelTagValue.ImageUnderstanding]: {
    icon: <IconCozImageFill />, //image
    color: 'coz-fg-color-purple',
    bg: 'coz-mg-color-purple',
  },
  [ModelTagValue.VideoUnderstanding]: {
    icon: <IconCozVideoFill />, //video
    color: 'coz-fg-color-purple',
    bg: 'coz-mg-color-purple',
  },
  [ModelTagValue.AudioUnderstanding]: {
    icon: <IconCozMusic />, //Audio
    color: 'coz-fg-color-purple',
    bg: 'coz-mg-color-purple',
  },
  [ModelTagValue.CodeSpecialization]: {
    icon: <IconCozCodeFill />, //Code Specialization
    color: 'coz-fg-color-cyan',
    bg: 'coz-mg-color-cyan',
  },
  [ModelTagValue.ToolInvocation]: {
    icon: <IconCozWrenchFill />, //tool call
    color: 'coz-fg-color-cyan',
    bg: 'coz-mg-color-cyan',
  },
  [ModelTagValue.Reasoning]: {
    icon: <IconCozLightbulbFill />, //inference
    color: 'coz-fg-color-cyan',
    bg: 'coz-mg-color-cyan',
  },
};
