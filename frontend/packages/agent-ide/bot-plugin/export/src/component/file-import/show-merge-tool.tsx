import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import { type DuplicateAPIInfo } from '@coze-arch/bot-api/plugin_develop';

interface MergeToolInfoProps {
  onOk?: () => void;
  onCancel?: () => void;
  duplicateInfos?: DuplicateAPIInfo[];
}

export function showMergeTool({
  duplicateInfos = [],
  onCancel,
  onOk,
}: MergeToolInfoProps) {
  UIModal.warning({
    title: I18n.t('duplicate_tools_within_plugin'),
    content: duplicateInfos?.map(item => (
      <div>{`${item.method}  ${I18n.t('path_has_duplicates', {
        path: item.path,
        num: item.count,
      })}`}</div>
    )),
    okText: I18n.t('merge_duplicate_tools'),
    cancelText: I18n.t('Cancel'),
    centered: true,
    icon: <IconWarningInfo />,
    okButtonProps: {
      type: 'warning',
    },
    onOk,
    onCancel,
  });
}
