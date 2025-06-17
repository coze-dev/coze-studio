import {
  ConfigurationTableStructureModule,
  createTableConfigMenuRegistry,
  type TableConfigMenuRegistry,
} from '@/features/knowledge-ide-table-config-menus';

export const knowledgeTableLocalConfigMenuContributes: TableConfigMenuRegistry =
  (() => {
    const knowledgeTableConfigMenuRegistry = createTableConfigMenuRegistry(
      'knowledge-ide-table-local-config-menu',
    );
    knowledgeTableConfigMenuRegistry.registerSome([
      {
        type: 'configuration-table-structure',
        module: ConfigurationTableStructureModule,
      },
    ]);
    return knowledgeTableConfigMenuRegistry;
  })();
