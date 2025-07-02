import { I18n } from '@coze-arch/i18n';

import {
  ZipIcon,
  VideoIcon,
  TextIcon as TxtIcon,
  ImageIcon,
  AudioIcon,
  CodeIcon,
  PptIcon,
  DocxIcon as DocIcon,
  XlsxIcon as TableIcon,
  UnknownIcon,
} from './icon';
import { FileTypeEnum } from './const';

const uploadTableConfig = {
  label: I18n.t('shortcut_modal_upload_component_file_format_table'),
  icon: TableIcon,
};

const uploadDocConfig = {
  label: I18n.t('shortcut_modal_upload_component_file_format_doc'),
  icon: DocIcon,
};

export const ACCEPT_UPLOAD_TYPES: Record<
  FileTypeEnum,
  {
    label: string;
    icon: string;
  }
> = {
  [FileTypeEnum.IMAGE]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_img'),
    icon: ImageIcon,
  },
  [FileTypeEnum.EXCEL]: uploadTableConfig,
  [FileTypeEnum.CSV]: uploadTableConfig,
  [FileTypeEnum.PDF]: uploadDocConfig,
  [FileTypeEnum.DOCX]: uploadDocConfig,
  [FileTypeEnum.DEFAULT_UNKNOWN]: {
    label: I18n.t('plugin_file_unknown'),
    icon: UnknownIcon,
  },
  [FileTypeEnum.AUDIO]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_audio'),
    icon: AudioIcon,
  },
  [FileTypeEnum.CODE]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_code'),
    icon: CodeIcon,
  },
  [FileTypeEnum.ARCHIVE]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_zip'),
    icon: ZipIcon,
  },
  [FileTypeEnum.PPT]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_ppt'),
    icon: PptIcon,
  },
  [FileTypeEnum.VIDEO]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_video'),
    icon: VideoIcon,
  },
  [FileTypeEnum.TXT]: {
    label: I18n.t('shortcut_modal_upload_component_file_format_txt'),
    icon: TxtIcon,
  },
};
