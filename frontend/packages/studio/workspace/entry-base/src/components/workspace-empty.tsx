import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty, IconCozBroom } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

interface WorkspaceEmptyProps {
  onClear?: () => void; // 清空按钮点击事件
  hasFilter?: boolean; // 是否有筛选项
}

export const WorkspaceEmpty: FC<WorkspaceEmptyProps> = ({
  onClear,
  hasFilter = false,
}) => (
  <div className="w-full h-full flex flex-col items-center pt-[120px]">
    <IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />
    <div className="text-[16px] font-[500] leading-[22px] mt-[8px] mb-[16px] coz-fg-primary">
      {I18n.t(
        hasFilter ? 'library_empty_no_results_found_under' : 'search_not_found',
      )}
    </div>
    {hasFilter ? (
      <Button
        color="primary"
        icon={<IconCozBroom />}
        onClick={() => {
          onClear?.();
        }}
      >
        {I18n.t('library_empty_clear_filters')}
      </Button>
    ) : null}
  </div>
);
