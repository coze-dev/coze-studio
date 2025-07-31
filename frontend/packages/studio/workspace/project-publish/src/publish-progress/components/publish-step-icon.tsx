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

import {
  IconCozCheckMarkCircle,
  IconCozClock,
  IconCozClockFill,
  IconCozCrossCircle,
  IconCozWarningCircle,
  type OriginIconProps,
} from '@coze-arch/coze-design/icons';
import { type StepProps } from '@coze-arch/coze-design';

export interface PublishStepIconProps {
  status: StepProps['status'] | 'warn';
}

export function PublishStepIcon({ status }: PublishStepIconProps) {
  const iconProps: Pick<OriginIconProps, 'width' | 'height'> = {
    width: '16px',
    height: '16px',
  };
  switch (status) {
    case 'wait':
      return <IconCozClock className="coz-fg-secondary" {...iconProps} />;
    case 'process':
      return <IconCozClockFill className="coz-fg-hglt" {...iconProps} />;
    case 'finish':
      return (
        <IconCozCheckMarkCircle className="coz-fg-hglt-green" {...iconProps} />
      );
    case 'warn':
      return (
        <IconCozWarningCircle className="coz-fg-hglt-yellow" {...iconProps} />
      );
    case 'error':
      return <IconCozCrossCircle className="coz-fg-hglt-red" {...iconProps} />;
    default:
      return null;
  }
}
