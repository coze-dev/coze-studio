import { useRequest } from 'ahooks';

export const useTosContent = (tosUrl?: string) => {
  const {
    data: content,
    loading,
    error,
  } = useRequest(
    async () => {
      if (!tosUrl) {
        return null;
      }
      const response = await fetch(tosUrl, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
    },
    {
      refreshDeps: [tosUrl],
    },
  );

  return { content, loading, error };
};
