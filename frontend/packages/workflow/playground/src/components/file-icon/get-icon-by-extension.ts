import mime from 'mime-types';
import {
  IconCozFileAudio,
  IconCozFileCode,
  IconCozFilePptx,
  IconCozFileDocx,
  IconCozFileTxt,
  IconCozFileZip,
  IconCozFileXlsx,
  IconCozFileVideo,
  IconCozFileOther,
  IconCozFilePdf,
} from '@coze-arch/coze-design/illustrations';

const codeExtensions = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'py',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'go',
  'rb',
  'php',
  'swift',
  'kt',
  'kts',
  'sql',
  'pl',
  'sh',
  'bash',
  'rs',
  'dart',
  'scala',
  'yaml',
  'yml',
  'json',
];

function isCodeFile(extension: string) {
  return codeExtensions.includes(extension);
}

function isAudioFile(extension: string) {
  const mimeType = mime.lookup(extension);
  return mimeType ? mimeType.startsWith('audio/') : false;
}

function isVideoFile(extension: string) {
  const mimeType = mime.lookup(extension);
  return mimeType ? mimeType.startsWith('video/') : false;
}

const ICON_MAP = {
  // ppt
  ppt: IconCozFilePptx,
  pptx: IconCozFilePptx,
  // doc
  doc: IconCozFileDocx,
  docx: IconCozFileDocx,
  pdf: IconCozFilePdf,
  // txt
  txt: IconCozFileTxt,
  // zip
  zip: IconCozFileZip,
  rar: IconCozFileZip,
  // excel
  xls: IconCozFileXlsx,
  xlsx: IconCozFileXlsx,
  csv: IconCozFileXlsx,
  // code
  code: IconCozFileCode,
  // video
  video: IconCozFileVideo,
  // audio
  audio: IconCozFileAudio,
};

export const getIconByExtension = (extension: string) => {
  let fileIcon = ICON_MAP[extension] ?? IconCozFileOther;
  if (isAudioFile(extension)) {
    fileIcon = ICON_MAP.audio;
  } else if (isVideoFile(extension)) {
    fileIcon = ICON_MAP.video;
  } else if (isCodeFile(extension)) {
    fileIcon = ICON_MAP.code;
  }

  return fileIcon;
};
