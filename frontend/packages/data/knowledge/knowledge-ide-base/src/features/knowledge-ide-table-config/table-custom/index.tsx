import { TableConfigButton, type TableConfigButtonProps } from '../base';
import { knowledgeTableConfigMenuContributes } from './knowledge-ide-table-config-menu-contributes';
export const TableCustomTableConfigButton = (props: TableConfigButtonProps) => (
  <TableConfigButton
    {...props}
    knowledgeTableConfigMenuContributes={knowledgeTableConfigMenuContributes}
  />
);
