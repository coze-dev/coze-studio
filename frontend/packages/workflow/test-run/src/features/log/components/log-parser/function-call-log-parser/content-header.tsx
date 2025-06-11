import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

import { useCopy } from '../../../hooks/use-copy';

export const ContentHeader: FC<
  PropsWithChildren<{
    source: unknown;
    className?: string;
  }>
> = ({ children, source, className }) => {
  const { handleCopy } = useCopy(source);

  return (
    <div className={classNames('flex items-center mb-1 h-4', className)}>
      <div className="font-medium coz-fg-secondary text-xs leading-4">
        {children}
      </div>
      <Tooltip content={I18n.t('workflow_250310_13')}>
        <div className="leading-none">
          <IconButton
            className="ml-0.5"
            wrapperClass="leading-[0px]"
            size="mini"
            icon={<IconCozCopy className="text-xs coz-fg-secondary" />}
            color="secondary"
            onClick={handleCopy}
          />
        </div>
      </Tooltip>
    </div>
  );
};
