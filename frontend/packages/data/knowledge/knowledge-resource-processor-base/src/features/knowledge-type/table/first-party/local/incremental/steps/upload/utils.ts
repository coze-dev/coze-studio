import {
  type UnitItem,
  FooterBtnStatus,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';

export function getButtonStatus(unitList: UnitItem[]) {
  if (
    unitList.length === 0 ||
    unitList.some(
      unitItem =>
        unitItem.name.length === 0 || unitItem.status !== UploadStatus.SUCCESS,
    )
  ) {
    return FooterBtnStatus.DISABLE;
  }
  return FooterBtnStatus.ENABLE;
}
