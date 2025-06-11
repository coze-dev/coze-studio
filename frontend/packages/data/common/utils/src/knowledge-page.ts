import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { FormatType } from '@coze-arch/bot-api/knowledge';

export const getFormatTypeFromUnitType = (type: UnitType) => {
  switch (type) {
    case UnitType.TABLE:
    case UnitType.TABLE_API:
    case UnitType.TABLE_DOC:
    case UnitType.TABLE_CUSTOM:
    case UnitType.TABLE_FEISHU:
    case UnitType.TABLE_GOOGLE_DRIVE:
      return FormatType.Table;
    case UnitType.IMAGE:
    case UnitType.IMAGE_FILE:
      return FormatType.Image;
    default:
      return FormatType.Text;
  }
};
