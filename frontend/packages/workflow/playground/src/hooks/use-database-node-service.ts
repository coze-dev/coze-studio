import { useService } from '@flowgram-adapter/free-layout-editor';

import { type DatabseNodeStore } from '@/services/database-node-service-impl';
import { DatabaseNodeService } from '@/services/database-node-service';

export function useDatabaseNodeService() {
  const databaseNodeService =
    useService<DatabaseNodeService>(DatabaseNodeService);

  return databaseNodeService;
}

export const useDatabaseServiceStore = <T>(
  selector: (s: DatabseNodeStore) => T,
) => {
  const databaseNodeService = useDatabaseNodeService();

  return databaseNodeService.store(selector);
};
