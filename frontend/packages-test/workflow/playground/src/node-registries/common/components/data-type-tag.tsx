import { ViewVariableType } from '@coze-workflow/base';
import { Tag } from '@coze-arch/coze-design';

const ViewDataTypeMap = {
  [ViewVariableType.String]: 'String',
  [ViewVariableType.Integer]: 'Integer',
  [ViewVariableType.Boolean]: 'Boolean',
  [ViewVariableType.Number]: 'Number',
  [ViewVariableType.Time]: 'Time',
  [ViewVariableType.File]: 'File',
  [ViewVariableType.Image]: 'File/Image',
  [ViewVariableType.Doc]: 'File/Doc',
  [ViewVariableType.Excel]: 'File/Excel',
  [ViewVariableType.Code]: 'File/Code',
  [ViewVariableType.Ppt]: 'File/PPT',
  [ViewVariableType.Txt]: 'File/Text',
  [ViewVariableType.Audio]: 'File/Audio',
  [ViewVariableType.Zip]: 'File/ZIP',
  [ViewVariableType.Video]: 'File/Video',
  [ViewVariableType.Svg]: 'File/SVG',
  [ViewVariableType.Voice]: 'File/Voice',
};

interface DataTypeTagProps {
  type?: ViewVariableType;
  disabled?: boolean;
}

export function DataTypeTag({ type, disabled }: DataTypeTagProps) {
  return (
    <Tag color="primary" size="mini" disabled={disabled}>
      {type === undefined ? 'undefined' : ViewDataTypeMap[type]}
    </Tag>
  );
}
