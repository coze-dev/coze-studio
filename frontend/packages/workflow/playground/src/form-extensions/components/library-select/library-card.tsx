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
