import type { FC, ReactNode } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Section } from '@/form';

interface LoopSettingsFieldProps {
  title?: string;
  tooltip?: string;
  testId?: string;
  children?: ReactNode | ReactNode[];
}

export const LoopSettingsSection: FC<LoopSettingsFieldProps> = ({
  title = I18n.t('workflow_loop_title'),
  tooltip,
  testId,
  children,
}) => {
  const { getNodeSetterId } = useNodeTestId();

  return (
    <Section
      title={title}
      tooltip={tooltip}
      testId={getNodeSetterId(testId ?? '')}
    >
      {children}
    </Section>
  );
};
