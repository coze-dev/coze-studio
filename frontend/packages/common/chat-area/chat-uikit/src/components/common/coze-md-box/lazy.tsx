import { type ComponentPropsWithRef, type FC } from 'react';

import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';

import { CozeLink } from '../../md-box-slots/link';
import { CozeImage } from '../../md-box-slots/coze-image';

export const LazyCozeMdBox: FC<
  ComponentPropsWithRef<typeof MdBoxLazy>
> = props => (
  <MdBoxLazy
    slots={{
      Image: CozeImage,
      Link: CozeLink,
    }}
    {...props}
  />
);
