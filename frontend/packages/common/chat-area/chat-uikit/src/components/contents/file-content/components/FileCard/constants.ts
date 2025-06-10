import { FileTypeEnum } from '@coze-common/chat-core/shared/const';

import EXCELSuccess from '../../../../../assets/file/xlsx-success.svg';
import EXCELFail from '../../../../../assets/file/xlsx-fail.svg';
import VIDEOSuccess from '../../../../../assets/file/video-success.svg';
import VIDEOFail from '../../../../../assets/file/video-fail.svg';
import TXTSuccess from '../../../../../assets/file/txt-success.svg';
import TXTFail from '../../../../../assets/file/txt-fail.svg';
import PPTSuccess from '../../../../../assets/file/ppt-success.svg';
import PPTFail from '../../../../../assets/file/ppt-fail.svg';
import PDFSuccess from '../../../../../assets/file/pdf-success.svg';
import PDFFail from '../../../../../assets/file/pdf-fail.svg';
import DOCXSuccess from '../../../../../assets/file/docx-success.svg';
import DOCXFail from '../../../../../assets/file/docx-fail.svg';
import DefaultUnknownSuccess from '../../../../../assets/file/default-unknown-success.svg';
import DefaultUnknownFail from '../../../../../assets/file/default-unknown-fail.svg';
import CSVSuccess from '../../../../../assets/file/csv-success.svg';
import CSVFail from '../../../../../assets/file/csv-fail.svg';
import CODESuccess from '../../../../../assets/file/code-success.svg';
import CODEFail from '../../../../../assets/file/code-fail.svg';
import AUDIOSuccess from '../../../../../assets/file/audio-success.svg';
import AUDIOFail from '../../../../../assets/file/audio-fail.svg';
import ARCHIVESuccess from '../../../../../assets/file/archive-success.svg';
import ARCHIVEFail from '../../../../../assets/file/archive-fail.svg';

export const SUCCESS_FILE_ICON_MAP = {
  [FileTypeEnum.CSV]: CSVSuccess,
  [FileTypeEnum.DOCX]: DOCXSuccess,
  [FileTypeEnum.EXCEL]: EXCELSuccess,
  [FileTypeEnum.PDF]: PDFSuccess,
  [FileTypeEnum.AUDIO]: AUDIOSuccess,
  [FileTypeEnum.VIDEO]: VIDEOSuccess,
  [FileTypeEnum.ARCHIVE]: ARCHIVESuccess,
  [FileTypeEnum.CODE]: CODESuccess,
  [FileTypeEnum.TXT]: TXTSuccess,
  [FileTypeEnum.PPT]: PPTSuccess,
  [FileTypeEnum.DEFAULT_UNKNOWN]: DefaultUnknownSuccess,
};

export const FAIL_FILE_ICON_MAP = {
  [FileTypeEnum.CSV]: CSVFail,
  [FileTypeEnum.DOCX]: DOCXFail,
  [FileTypeEnum.EXCEL]: EXCELFail,
  [FileTypeEnum.PDF]: PDFFail,
  [FileTypeEnum.AUDIO]: AUDIOFail,
  [FileTypeEnum.VIDEO]: VIDEOFail,
  [FileTypeEnum.ARCHIVE]: ARCHIVEFail,
  [FileTypeEnum.CODE]: CODEFail,
  [FileTypeEnum.TXT]: TXTFail,
  [FileTypeEnum.PPT]: PPTFail,
  [FileTypeEnum.DEFAULT_UNKNOWN]: DefaultUnknownFail,
};

export const FILE_CARD_WIDTH = 280;
export const PERCENT_DENOMINATOR = 100;
