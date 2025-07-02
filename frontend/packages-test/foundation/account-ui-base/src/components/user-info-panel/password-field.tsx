import { useState } from 'react';

import { IconCozEyeClose, IconCozEye } from '@coze-arch/coze-design/icons';

export const PasswordDesc = ({ value }: { value: string }) => {
  const [show] = useState(false);

  const displayValue = show ? value : '******';

  return (
    <div className="flex">
      <div>{displayValue}</div>
      {show ? <IconCozEye /> : <IconCozEyeClose />}
    </div>
  );
};
