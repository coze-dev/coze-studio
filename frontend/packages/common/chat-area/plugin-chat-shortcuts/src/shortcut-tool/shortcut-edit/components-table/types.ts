import { type shortcut_command } from '@coze-arch/bot-api/playground_api';

import { type UploadItemType } from '../../../utils/file-const';
import { type FileValue } from '../../../components/short-cut-panel/widgets/types';

export type ComponentsWithId = shortcut_command.Components & { id: string };

export type ComponentTypeSelectContentRadioValueType =
  | 'text'
  | 'select'
  | 'upload';

export interface BaseComponentTypeItem {
  type: ComponentTypeSelectContentRadioValueType;
}

export interface TextComponentTypeItem extends BaseComponentTypeItem {
  type: 'text';
}

export interface SelectComponentTypeItem extends BaseComponentTypeItem {
  type: 'select';
  options: string[];
}

export interface UploadComponentTypeItem extends BaseComponentTypeItem {
  type: 'upload';
  uploadTypes: UploadItemType[];
}

export type ComponentTypeItem =
  | TextComponentTypeItem
  | SelectComponentTypeItem
  | UploadComponentTypeItem;

export type TValue = string | FileValue | undefined;

export type TCustomUpload = (uploadParams: {
  file: File;
  onProgress?: (percent: number) => void;
  onSuccess?: (url: string, width?: number, height?: number) => void;
  onError?: (e: { status?: number }) => void;
}) => void;

export type UploadItemConfig = {
  [key in UploadItemType]: {
    maxSize?: number;
  };
};
