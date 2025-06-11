import { DocumentSource, FormatType } from '@coze-arch/bot-api/knowledge';
import { isFeishuOrLarkDocumentSource } from '@coze-data/utils';
import { IconUnitsTable, IconUnitsFile } from '@coze-arch/bot-icons';

import { IconWithSuffix } from './suffix';

// 获取 icon
export const RenderDocumentIcon = ({
  formatType,
  sourceType,
  isDisconnect,
  className,
  iconSuffixClassName,
}: {
  formatType?: FormatType;
  sourceType?: DocumentSource;
  isDisconnect?: boolean;
  className?: string;
  iconSuffixClassName?: string;
}) => {
  if (
    sourceType &&
    ([DocumentSource.Notion, DocumentSource.GoogleDrive].includes(sourceType) ||
      isFeishuOrLarkDocumentSource(sourceType))
  ) {
    return (
      <IconWithSuffix
        hasSuffix={!!isDisconnect}
        formatType={formatType}
        className={iconSuffixClassName}
      />
    );
  } else {
    return formatType === FormatType.Table ? (
      <IconUnitsTable className={className} />
    ) : (
      <IconUnitsFile className={className} />
    );
  }
};
