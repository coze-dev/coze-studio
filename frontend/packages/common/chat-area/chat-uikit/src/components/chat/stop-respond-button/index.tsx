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

import { type FC } from 'react';

import classNames from 'classnames';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

interface IProps {
  className?: string;
  content: string;
  onClick?: () => void;
}

export const StopRespondButton: FC<IProps> = props => {
  const { content, onClick, className } = props;
  return (
    <Button
      color="secondary"
      onClick={onClick}
      className={classNames(
        'coz-stroke-primary',
        'coz-fg-primary',
        'border-[1px]',
        'border-solid',
        'coz-shadow-default',
        className,
      )}
      icon={<IconCozStopCircle />}
    >
      {content}
    </Button>
  );
};

StopRespondButton.displayName = 'StopRespondButton';
