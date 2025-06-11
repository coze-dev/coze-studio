import { type ReactNode, useMemo } from 'react';

import { groupBy } from 'lodash-es';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type Model } from '@coze-arch/bot-api/developer_api';

import { ModelOptionGroup } from '../model-option-group';
import { ModelOption } from '../model-option';

/** Popover 的 模型列表状态，对应详细配置状态。单纯为了避免组件过大而做的拆分 */
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
  /** 是否将列表设置为 display: none（为了保留 scrollTop 信息） */
  hidden: boolean;
  disabled?: boolean;
  selectedModelId: string;
  selectedModel: Model | undefined;
  modelList: Model[];
  /** 额外头部插槽 */
  extraHeaderSlot?: ReactNode;
  /** 返回是否切换成功 */
  onModelClick: (model: Model) => boolean;
  onDetailClick: (modelId: string) => void;
  onConfigClick: (model: Model) => void;
  enableConfig?: boolean;
  enableJumpDetail?: boolean;
}) {
  const { modelGroups } = useMemo(() => {
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

      {modelGroups.map((group, idx) => (
        <ModelOptionGroup
          key={group[0]?.model_series?.series_name ?? idx}
          type={group[0]?.model_status_details?.is_new_model ? 'new' : 'normal'}
          icon={group[0]?.model_series?.icon_url || ''}
          name={group[0]?.model_series?.series_name || ''}
          desc={I18n.t('model_list_model_company', {
            company: group[0]?.model_series?.model_vendor || '',
          })}
          tips={group[0]?.model_series?.model_tips || ''}
        >
          {group.map(m => (
            <ModelOption
              key={m.model_type}
              model={m}
              disabled={disabled}
              selected={String(m.model_type) === selectedModelId}
              onClick={() => onModelClick(m)}
              enableJumpDetail={enableJumpDetail}
              onDetailClick={onDetailClick}
              enableConfig={
                enableConfig &&
                // 在 disabled 状态下，只能查看选中模型的详细配置
                (!disabled || String(m.model_type) === selectedModelId)
              }
              onConfigClick={() => {
                onConfigClick(m);
              }}
            />
          ))}
        </ModelOptionGroup>
      ))}
    </div>
  );
}
