import { ViewVariableType } from '../types/view-variable-type';

export const ACCEPT_MAP = {
  [ViewVariableType.Image]: ['image/*'],
  [ViewVariableType.Doc]: ['.docx', '.doc', '.pdf'],
  [ViewVariableType.Audio]: [
    '.mp3',
    '.wav',
    '.aac',
    '.flac',
    '.ogg',
    '.wma',
    '.alac',
    '.mid',
    '.midi',
    '.ac3',
    '.dsd',
  ],
  [ViewVariableType.Excel]: ['.xls', '.xlsx', '.csv'],
  [ViewVariableType.Video]: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
  [ViewVariableType.Zip]: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  [ViewVariableType.Code]: ['.py', '.java', '.c', '.cpp', '.js', '.css'],
  [ViewVariableType.Txt]: ['.txt'],
  [ViewVariableType.Ppt]: ['.ppt', '.pptx'],
  [ViewVariableType.Svg]: ['.svg'],
};

export const getFileAccept = (
  inputType: ViewVariableType,
  availableFileTypes?: ViewVariableType[],
) => {
  let accept: string;
  const itemType = ViewVariableType.isArrayType(inputType)
    ? ViewVariableType.getArraySubType(inputType)
    : inputType;

  if (itemType === ViewVariableType.File) {
    if (availableFileTypes?.length) {
      accept = availableFileTypes
        .map(type => ACCEPT_MAP[type]?.join(','))
        .join(',');
    } else {
      accept = Object.values(ACCEPT_MAP)
        .map(items => items.join(','))
        .join(',');
    }
  } else {
    accept = (ACCEPT_MAP[itemType] || []).join(',');
  }

  return accept;
};
