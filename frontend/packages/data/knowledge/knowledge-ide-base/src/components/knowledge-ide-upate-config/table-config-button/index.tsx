import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

export interface TableConfigButtonProps {
  documentInfo: DocumentInfo;
  onChangeDocList?: (docList: DocumentInfo[]) => void;
  reload: () => void;
  canEdit?: boolean;
}
