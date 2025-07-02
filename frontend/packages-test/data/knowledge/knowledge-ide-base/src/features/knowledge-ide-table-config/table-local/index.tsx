import { TableConfigButton, type TableConfigButtonProps } from '../base';
import { knowledgeTableLocalConfigMenuContributes } from './knowledge-ide-table-config-menu-contributes';
export const TableLocalTableConfigButton = (props: TableConfigButtonProps) => (
  <TableConfigButton
    {...props}
    knowledgeTableConfigMenuContributes={
      knowledgeTableLocalConfigMenuContributes
    }
  />
);
