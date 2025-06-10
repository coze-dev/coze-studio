import { type Ref, forwardRef, type FC } from 'react';

import { type ButtonProps } from '@coze-arch/bot-semi/Button';
import { Button } from '@coze-arch/bot-semi';

export type BotDebugButtonProps = ButtonProps & {
  readonly: boolean;
};
export const BotDebugButton: FC<BotDebugButtonProps> = forwardRef(
  (props: BotDebugButtonProps, ref: Ref<Button>) => {
    const { readonly, ...rest } = props;

    if (readonly) {
      return null;
    }
    return <Button {...rest} ref={ref} />;
  },
);
