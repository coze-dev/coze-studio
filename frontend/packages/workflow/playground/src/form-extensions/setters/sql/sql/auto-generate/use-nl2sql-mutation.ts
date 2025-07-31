/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        // There is a problem with the back-end interface definition bot_id must be passed, but it is not actually needed. Communicate with the back-end and pass 0 processing here.
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
