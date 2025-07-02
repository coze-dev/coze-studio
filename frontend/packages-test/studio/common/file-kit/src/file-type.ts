import { FileTypeEnum, type TFileTypeConfig } from './const';

/**
 * 文件类型
 * {@link 
 * {@link https://www.iana.org/assignments/media-types/media-types.xhtml#image}
 */
export const FILE_TYPE_CONFIG: readonly TFileTypeConfig[] = [
  {
    fileType: FileTypeEnum.IMAGE,
    accept: ['image/*'],
    judge: file => file.type.startsWith('image/'),
  },
  {
    fileType: FileTypeEnum.AUDIO,
    accept: [
      '.mp3',
      '.wav',
      '.aac',
      '.flac',
      '.ogg',
      '.wma',
      '.alac',
      // .midi 和 .mid 都是MIDI（Musical Instrument Digital Interface）文件的扩展名 - GPT
      '.mid',
      '.midi',
      '.ac3',
      '.dsd',
    ],
    judge: file => file.type.startsWith('audio/'),
  },
  {
    fileType: FileTypeEnum.PDF,
    accept: ['.pdf'],
  },
  {
    fileType: FileTypeEnum.DOCX,
    accept: ['.docx', '.doc'],
  },
  {
    fileType: FileTypeEnum.EXCEL,
    accept: ['.xls', '.xlsx'],
  },
  {
    fileType: FileTypeEnum.CSV,
    accept: ['.csv'],
  },
  {
    fileType: FileTypeEnum.VIDEO,
    accept: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
    judge: file => file.type.startsWith('video/'),
  },
  {
    fileType: FileTypeEnum.ARCHIVE,
    accept: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  },
  {
    fileType: FileTypeEnum.CODE,
    accept: ['.py', '.java', '.c', '.cpp', '.js', '.html', '.css'],
  },
  {
    fileType: FileTypeEnum.TXT,
    accept: ['.txt'],
  },
  {
    fileType: FileTypeEnum.PPT,
    accept: ['.ppt', '.pptx'],
  },
  {
    fileType: FileTypeEnum.DEFAULT_UNKNOWN,
    judge: () => true,
    accept: ['*'],
  },
];
