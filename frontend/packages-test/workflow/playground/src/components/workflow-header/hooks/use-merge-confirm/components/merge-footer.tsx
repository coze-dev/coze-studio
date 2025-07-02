import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';

import { useMerge } from '../use-merge';

export const MergeFooter = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void;
  onOk: () => Promise<void>;
}) => {
  const { handleMerge } = useMerge();

  return (
    <div className="flex justify-end my-6 space-x-3">
      <UIButton onClick={onCancel} type="tertiary">
        {I18n.t('Cancel')}
      </UIButton>

      <UIButton
        theme="solid"
        onClick={async () => {
          const merged = await handleMerge();
          if (merged) {
            await onOk();
          }
        }}
      >
        {I18n.t('Confirm')}
      </UIButton>
    </div>
  );
};
