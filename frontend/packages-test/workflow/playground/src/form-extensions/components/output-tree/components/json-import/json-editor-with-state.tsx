import { type FC, useState } from 'react';

import { JSONEditor } from '../json-editor';
import type { TreeNodeCustomData } from '../custom-tree-node/type';

export const JSONEditorWithState: FC<{
  updateKey: number;
  uniqueId: string;
  onChange: (data: TreeNodeCustomData[]) => void;
  onClose: () => void;
}> = props => {
  const { updateKey, uniqueId, onClose, onChange } = props;

  const [JSONString, setJSONString] = useState('');

  return (
    <JSONEditor
      key={updateKey}
      id={uniqueId}
      value={JSONString}
      setValue={(value: string) => {
        setJSONString(value);
      }}
      onClose={onClose}
      onChange={onChange}
    />
  );
};
