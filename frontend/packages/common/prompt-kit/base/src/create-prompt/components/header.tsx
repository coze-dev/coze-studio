import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze/coze-design/icons';
import { Tooltip, Divider, IconButton } from '@coze/coze-design';
interface PromptHeaderProps {
  canEdit: boolean;
  onEditIconClick?: () => void;
  mode: 'info' | 'edit' | 'create';
}
export const PromptHeader = ({
  canEdit,
  onEditIconClick,
  mode,
}: PromptHeaderProps) => {
  if (mode === 'info' && canEdit) {
    return (
      <div className="flex items-center justify-between w-full">
        <span>{I18n.t('prompt_detail_prompt_detail')}</span>
        <div className="flex items-center ">
          <Tooltip content={I18n.t('prompt_library_edit')}>
            <IconButton
              color="secondary"
              icon={<IconCozEdit className="semi-icon-default" />}
              onClick={onEditIconClick}
              size="small"
            />
          </Tooltip>
          <Divider layout="vertical" className="mx-[10px] coz-stroke-primary" />
        </div>
      </div>
    );
  }
  if (mode === 'create') {
    return <>{I18n.t('creat_new_prompt')}</>;
  }

  if (mode === 'edit') {
    return <>{I18n.t('edit_prompt')}</>;
  }

  return <>{I18n.t('prompt_detail_prompt_detail')}</>;
};
