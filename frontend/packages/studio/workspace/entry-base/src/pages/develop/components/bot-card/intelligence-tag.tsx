import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
export interface IntelligenceTagProps {
  intelligenceType: IntelligenceType | undefined;
}

export const IntelligenceTag: React.FC<IntelligenceTagProps> = ({
  intelligenceType,
}) => {
  if (intelligenceType === IntelligenceType.Project) {
    return (
      <Tag color="brand" size="small" className="w-fit">
        {I18n.t('develop_list_card_tag_project')}
      </Tag>
    );
  }
  if (intelligenceType === IntelligenceType.Bot) {
    return (
      <Tag color="primary" size="small" className="w-fit">
        {I18n.t('develop_list_card_tag_agent')}
      </Tag>
    );
  }
  // 社区版暂不支持该功能
  if (intelligenceType === IntelligenceType.DouyinAvatarBot) {
    return (
      <Tag color="red" size="small" className="w-fit">
        {/* TODO: i18n 文案 */}
        抖音分身
      </Tag>
    );
  }
  return null;
};
