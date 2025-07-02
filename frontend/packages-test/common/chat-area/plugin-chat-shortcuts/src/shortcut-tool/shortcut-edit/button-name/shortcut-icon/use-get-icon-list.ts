import { useRequest } from 'ahooks';
import { GetFileUrlsScene } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
export const useGetIconList = () => {
  const { data, loading, error } = useRequest(
    async () =>
      await PlaygroundApi.GetFileUrls({
        scene: GetFileUrlsScene.shorcutIcon,
      }),
  );
  return {
    iconList: data?.file_list ?? [],
    loading,
    error,
  };
};
