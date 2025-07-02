import { useProjectInfo } from './use-project-info';

export const useProjectVariables = (projectID?: string) => {
  const { variableList, isLoading } = useProjectInfo(projectID);

  return {
    variables: variableList,
    isLoading,
  };
};
