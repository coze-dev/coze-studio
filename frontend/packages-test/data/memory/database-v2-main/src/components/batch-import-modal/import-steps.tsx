import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Steps } from '@coze-arch/coze-design';

export enum BatchImportStep {
  Upload,
  Config,
  Preview,
  Process,
}

export interface BatchImportStepsProps {
  step: BatchImportStep;
}

export function BatchImportSteps({ step }: BatchImportStepsProps) {
  return (
    <Steps
      type="basic"
      hasLine={false}
      current={step}
      className={classNames(
        'my-[24px] justify-center',
        '[&_.semi-steps-item]:flex-none',
        '[&_.semi-steps-item-title]:!max-w-[unset]',
      )}
    >
      <Steps.Step title={I18n.t('db_optimize_014')} />
      <Steps.Step title={I18n.t('db_optimize_015')} />
      <Steps.Step title={I18n.t('db_optimize_016')} />
      <Steps.Step title={I18n.t('db_optimize_017')} />
    </Steps>
  );
}
