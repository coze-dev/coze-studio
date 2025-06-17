import { useMemo, type FC } from 'react';

import { useWatchFormErrors } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { cronJobTranslator } from '@coze-workflow/components';
import { CronJobType, type CronJobValue } from '@coze-workflow/nodes';
import { ValueExpressionType, ValueExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { Text } from '@/form-extensions/components/text';

import { type DynamicComponentProps } from '../dynamic-form';
import { FixCronjobSelect } from './fix-cronjob';
import { AICronjobSelect } from './ai-cronjob';

type CronJobSelectProps = DynamicComponentProps<CronJobValue> & {
  needRefInput?: boolean;
  className?: string;
};

export const CronJobSelect: FC<CronJobSelectProps> = ({
  needRefInput,
  className = '',
  value = {
    type: CronJobType.Selecting,
    content: {
      type: ValueExpressionType.LITERAL,
      content: '',
    },
  },
  onChange: _onChange,
  readonly,
}) => {
  const node = useCurrentEntity();
  const errors = useWatchFormErrors(node);
  const hasError = (errors ?? []).length > 0;

  const type = value.type ?? CronJobType.Selecting;
  const onChange = (content: ValueExpression | undefined) => {
    _onChange({
      type,
      content: content ?? {
        type: ValueExpressionType.LITERAL,
      },
    });
  };

  const cronjobTranslateText = useMemo(() => {
    if (
      hasError ||
      type === CronJobType.Selecting ||
      (value.content && ValueExpression.isRef(value.content))
    ) {
      return '';
    }

    return cronJobTranslator(value.content?.content as unknown as string);
  }, [hasError, value.content, type]);

  return (
    <div className={className}>
      <div className="flex flex-row gap-[2px]">
        <Select
          size="small"
          value={type}
          className="w-fit mb-[4px]"
          disabled={readonly}
          onChange={v => {
            _onChange({
              type: v as CronJobType,
              content: {
                type: ValueExpressionType.LITERAL,
              },
            });
          }}
          optionList={[
            {
              label: I18n.t(
                'workflow_start_trigger_cron_option',
                {},
                '选择预设时间',
              ),
              value: CronJobType.Selecting,
            },
            {
              label: I18n.t(
                'workflow_start_trigger_cron_job',
                {},
                '使用Cron表达式',
              ),
              value: CronJobType.Cronjob,
            },
          ]}
        ></Select>

        <div className="flex-1 overflow-hidden">
          {type === CronJobType.Selecting ? (
            <FixCronjobSelect
              hasError={hasError}
              value={value.content}
              onChange={onChange}
              readonly={readonly}
            />
          ) : (
            <AICronjobSelect
              hasError={hasError}
              value={value.content}
              onChange={onChange}
              readonly={readonly}
              node={node}
              needRefInput={needRefInput}
            />
          )}
        </div>
      </div>
      {cronjobTranslateText ? (
        <div className="coz-mg-primary w-full h-[24px] flex flex-row items-center justify-center rounded-[4px]">
          <Text text={cronjobTranslateText} className="text-[12px]" />
        </div>
      ) : null}
    </div>
  );
};
