import { type Ref, forwardRef, type FC } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { type IconButtonProps } from '@coze/coze-design/src/components/button/button-types';
import { Button, IconButton } from '@coze/coze-design';
import { type UIButton } from '@coze-arch/bot-semi';

import s from './index.module.less';

export const BotDebugButton: FC<IconButtonProps> = forwardRef(
  (props: IconButtonProps, ref: Ref<UIButton>) => {
    const isReadonly = useBotDetailIsReadonly();

    const className = props.theme || '';
    if (isReadonly) {
      return null;
    }
    if (props.icon && !props.children) {
      return <IconButton {...props} className={s[className]} ref={ref} />;
    }
    return <Button {...props} className={s[className]} ref={ref} />;
  },
);
