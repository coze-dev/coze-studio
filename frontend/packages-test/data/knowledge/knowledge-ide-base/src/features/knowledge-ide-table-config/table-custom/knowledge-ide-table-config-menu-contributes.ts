import {
  ConfigurationTableStructureModule,
  createTableConfigMenuRegistry,
  type TableConfigMenuRegistry,
} from '@/features/knowledge-ide-table-config-menus';

export const knowledgeTableConfigMenuContributes: TableConfigMenuRegistry =
  (() => {
    const knowledgeTableConfigMenuRegistry = createTableConfigMenuRegistry(
      'knowledge-ide-table-custom-config-menu',
    );
    knowledgeTableConfigMenuRegistry.registerSome([
      {
        type: 'configuration-table-structure',
        module: ConfigurationTableStructureModule,
      },
    ]);
    return knowledgeTableConfigMenuRegistry;
  })();
