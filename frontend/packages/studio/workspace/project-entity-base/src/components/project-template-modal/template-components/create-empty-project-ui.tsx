import { I18n } from '@coze-arch/i18n';
import { IconCozPlusFill } from '@coze/coze-design/icons';

import { ProjectTemplateCardUI } from './project-template-card';

export const CreateEmptyProjectUI: React.FC<{
  onClick: (() => void) | undefined;
}> = ({ onClick }) => (
  <ProjectTemplateCardUI
    onClick={onClick}
    className="h-200px flex items-center justify-center flex-col coz-fg-primary"
  >
    <IconCozPlusFill />
    <div className="py-6px px-8px text-[14px] leading-[20px] font-medium">
      {I18n.t('creat_project_creat_new_project')}
    </div>
  </ProjectTemplateCardUI>
);
