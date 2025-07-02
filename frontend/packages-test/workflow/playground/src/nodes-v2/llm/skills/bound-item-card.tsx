import { type FC, type ReactNode } from 'react';

import copy from 'copy-to-clipboard';
import { type APIParameter } from '@coze-workflow/base/api';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { IconCozCopy, IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, Toast } from '@coze-arch/coze-design';

import { VariableTypeTag } from '@/form-extensions/components/variable-type-tag';
import { IconNameDescCard } from '@/form-extensions/components/icon-name-desc-card';

import { TooltipAction } from './tooltip-action';
import { TypeMap } from './constants';

interface BoundItemCardProps {
  iconUrl?: string;
  title: string;
  pasteTitle?: string;
  params?: Array<APIParameter>;
  description?: ReactNode;
  settingRender: ReactNode;
  versionRender?: ReactNode;
  onRemove?: () => void;
  readonly?: boolean;
  hideActions?: boolean;
  className?: string;
}

export const BoundItemCard: FC<BoundItemCardProps> = props => {
  const {
    title,
    pasteTitle,
    iconUrl,
    description,
    onRemove,
    settingRender,
    versionRender,
    params,
    readonly,
    hideActions,
    className,
  } = props;

  const handleCopy = () => {
    try {
      const res = copy(pasteTitle ?? title);
      if (!res) {
        throw new CustomError(ReportEventNames.copy, 'empty content');
      }

      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
        id: 'plugin_copy_id',
      });
    } catch {
      Toast.warning({
        content: I18n.t('copy_failed'),
        showClose: false,
      });
    }
  };

  const actions = (
    <>
      {params ? (
        <TooltipAction
          tooltip={params.map(param => (
            <div className="mb-3">
              <div className="flex items-center mb-2 gap-1">
                {param.name}
                {TypeMap.get(param.type as number) ? (
                  <VariableTypeTag size="xs">
                    {TypeMap.get(param.type as number)}
                  </VariableTypeTag>
                ) : null}
                {param.is_required ? (
                  <Tag size="mini" color="yellow">
                    {I18n.t('required')}
                  </Tag>
                ) : null}
              </div>
              <div className="font-normal coz-fg-secondary leading-4">
                {param.desc}
              </div>
            </div>
          ))}
          icon={<IconCozInfoCircle />}
        />
      ) : null}

      <TooltipAction
        tooltip={I18n.t('bot_edit_page_plugin_copy_tool_name_tip')}
        icon={<IconCozCopy />}
        onClick={handleCopy}
      />
      {settingRender}
    </>
  );

  return (
    <IconNameDescCard
      icon={iconUrl}
      name={title}
      description={description as string}
      onRemove={onRemove}
      actions={hideActions ? [] : actions}
      nameSuffix={versionRender}
      readonly={readonly}
      className={className}
      descriptionTooltipPosition="bottom"
    />
  );
};
