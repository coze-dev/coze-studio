import { useMutation, type DefaultError } from '@tanstack/react-query';
import { MemoryApi } from '@coze-arch/bot-api';

import { useCurrentDatabaseID } from '@/hooks';

export const useNl2SqlMutation = () => {
  const databaseID = useCurrentDatabaseID();
  const {
    data: sql,
    mutate: nl2sql,
    isPending: isFetching,
  } = useMutation<string, DefaultError, { text: string }>({
    mutationFn: async ({ text }) => {
      const data = await MemoryApi.GetNL2SQL({
        // 后端接口定义有问题 bot_id为必传 实际不需要 跟后端沟通这里传0处理
        bot_id: 0,
        database_id: databaseID,
        text,
        table_type: 1,
      });
      return data.sql;
    },
  });

  return {
    sql,
    nl2sql,
    isFetching,
  };
};
