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
