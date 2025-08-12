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

import { type ReactNode, useMemo } from 'react';

import { groupBy } from 'lodash-es';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type Model } from '@coze-arch/bot-api/developer_api';

import { ModelOptionGroup } from '../model-option-group';
import { ModelOption } from '../model-option';

/** Popover's model list state corresponds to the detailed configuration state. Splitting purely to avoid oversized components */
export function PopoverModelListView({
  hidden,
  disabled,
  selectedModelId,
  selectedModel,
  modelList,
  extraHeaderSlot,
  onModelClick,
  onDetailClick,
  onConfigClick,
  enableConfig,
  enableJumpDetail,
}: {
  /** Whether to set the list to display: none (to preserve scrollTop information) */
  hidden: boolean;
  disabled?: boolean;
  selectedModelId: string;
  selectedModel: Model | undefined;
  modelList: Model[];
  /** Extra head slot */
  extraHeaderSlot?: ReactNode;
  /** Return whether the switch was successful */
  onModelClick: (model: Model) => boolean;
  onDetailClick: (modelId: string) => void;
  onConfigClick: (model: Model) => void;
  enableConfig?: boolean;
  enableJumpDetail?: boolean;
}) {
  const { modelGroups } = useMemo(() => {
    /** The open-source version is not classified, but tiled */
    if (IS_OPEN_SOURCE) {
      return { modelGroups: [modelList] };
    }
    const modelSeriesGroups = groupBy(
      modelList,
      model => model.model_series?.series_name,
    );
    return {
      modelGroups: Object.values(modelSeriesGroups).filter(
        (group): group is Model[] => !!group?.length,
      ),
    };
  }, [modelList]);

  const renderModelOption = (model: Model) => (
    <ModelOption
      key={model.model_type}
      model={model}
      disabled={disabled}
      selected={String(model.model_type) === selectedModelId}
      onClick={() => onModelClick(model)}
      enableJumpDetail={enableJumpDetail}
      onDetailClick={onDetailClick}
      enableConfig={
        enableConfig &&
        // In the disabled state, you can only view the detailed configuration of the selected model
        (!disabled || String(model.model_type) === selectedModelId)
      }
      onConfigClick={() => {
        onConfigClick(model);
      }}
    />
  );

  return (
    <div
      className={cls(
        'max-h-[inherit]', // https://stackoverflow.com/questions/14262938/child-with-max-height-100-overflows-parent
        'p-[8px] flex flex-col gap-[8px] overflow-auto',
        {
          hidden,
        },
      )}
    >
      <div className="flex items-center justify-between pl-4 pr-2 box-content h-[32px] pb-2 pt-1">
        <div className="text-xxl font-medium coz-fg-plus">
          {I18n.t('model_selection')}
        </div>
        {extraHeaderSlot}
      </div>
      {selectedModel?.model_status_details?.is_upcoming_deprecated ? (
        <section className="p-[12px] pl-[16px] rounded-[8px] coz-mg-hglt-yellow">
          <div className="text-[14px] leading-[20px] font-medium coz-fg-plus">
            {I18n.t('model_list_model_deprecation_notice')}
          </div>
          <div className="text-[12px] leading-[16px] coz-fg-primary">
            {I18n.t('model_list_model_switch_announcement', {
              model_deprecated: selectedModel.name,
              date: selectedModel.model_status_details.deprecated_date,
              model_up: selectedModel.model_status_details.replace_model_name,
            })}
          </div>
        </section>
      ) : null}

      {modelGroups.map((group, idx) => {
        if (IS_OPEN_SOURCE) {
          return group.map(renderModelOption);
        }
        return (
          <ModelOptionGroup
            key={group[0]?.model_series?.series_name ?? idx}
            type={
              group[0]?.model_status_details?.is_new_model ? 'new' : 'normal'
            }
            icon={group[0]?.model_series?.icon_url || ''}
            name={group[0]?.model_series?.series_name || ''}
            desc={I18n.t('model_list_model_company', {
              company: group[0]?.model_series?.model_vendor || '',
            })}
            tips={group[0]?.model_series?.model_tips || ''}
          >
            {group.map(renderModelOption)}
          </ModelOptionGroup>
        );
      })}
    </div>
  );
}
