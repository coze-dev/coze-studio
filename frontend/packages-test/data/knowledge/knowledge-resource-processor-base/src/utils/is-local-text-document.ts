import {
  type DocumentInfo,
  DocumentSource,
  FormatType,
} from '@coze-arch/idl/knowledge';

export const isLocalTextDocument = (document: DocumentInfo) =>
  document.format_type === FormatType.Text &&
  document.source_type === DocumentSource.Document;
