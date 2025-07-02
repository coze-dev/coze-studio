import type { DocumentInfo } from '@coze-arch/bot-api/knowledge';
export interface TableConfigMenuModuleProps {
  documentInfo: DocumentInfo;
  reload?: () => void;
  onChangeDocList?: (docList: DocumentInfo[]) => void;
}

export interface TableConfigMenuModule {
  Component: React.ComponentType<TableConfigMenuModuleProps>;
}
