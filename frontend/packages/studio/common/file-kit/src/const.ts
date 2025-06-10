import { type EnumToUnion } from './types/util';

export const enum FileTypeEnum {
  PDF = 'pdf',
  DOCX = 'docx',
  EXCEL = 'excel',
  CSV = 'csv',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  ARCHIVE = 'archive',
  CODE = 'code',
  TXT = 'txt',
  PPT = 'ppt',
  DEFAULT_UNKNOWN = 'default_unknown',
}

export type FileType = EnumToUnion<typeof FileTypeEnum>;

export interface TFileTypeConfig {
  fileType: FileTypeEnum;
  accept: string[];
  judge?: (file: Pick<File, 'type'>) => boolean;
}
