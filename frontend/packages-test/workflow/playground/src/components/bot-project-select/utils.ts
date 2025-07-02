import { IntelligenceType } from '@coze-arch/idl/intelligence_api';

export const isItemDisabled = (
  { disableBot, disableProject },
  type?: IntelligenceType,
) => {
  const isBot = type === IntelligenceType.Bot;
  const isProject = type === IntelligenceType.Project;

  const disabled = (isBot && disableBot) || (isProject && disableProject);
  return disabled || !type;
};
