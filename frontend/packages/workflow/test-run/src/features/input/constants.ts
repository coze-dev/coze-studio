import { ViewVariableType } from '@coze-workflow/base';

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
