import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { type ILibraryItem } from '../../types';

interface AddLibraryActionProps {
  library: ILibraryItem;
  onClick: (library: ILibraryItem) => void;
}
export const AddLibraryAction = ({
  library,
  onClick,
}: AddLibraryActionProps) => (
  <Button onClick={() => onClick(library)} color="primary" size="small">
    {I18n.t('add')}
  </Button>
);
