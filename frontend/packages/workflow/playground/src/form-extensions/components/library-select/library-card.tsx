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

import { IconNameDescCard } from '../icon-name-desc-card';
import { type Library } from './types';

interface LibraryCardProps {
  readonly?: boolean;
  library: Library;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  testID?: string;
  isInvalid?: boolean;
}

export const LibraryCard: FC<LibraryCardProps> = props => {
  const {
    readonly,
    onDelete,
    onClick,
    library,
    testID = '',
    isInvalid,
  } = props;

  return (
    <IconNameDescCard
      readonly={readonly}
      name={library?.name}
      nameSuffix={library?.nameExtra}
      description={library?.description}
      icon={library?.iconUrl}
      onRemove={() => onDelete?.(library.id)}
      testID={testID}
      onClick={() => onClick?.(library.id)}
      isInvalid={isInvalid}
    />
  );
};
