import { useIDEGlobalContext } from '../context';

export const useProjectId = () => {
  const store = useIDEGlobalContext();
  const projectId = store(state => state.projectId);

  return projectId;
};
