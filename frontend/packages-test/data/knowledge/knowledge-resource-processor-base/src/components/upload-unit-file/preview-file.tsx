import { type FC } from 'react';

import { type RenderFileItemProps } from '@coze-arch/bot-semi/Upload';
import {
  IconPDFFile,
  IconUnknowFile as IconUnknownFile,
  IconTextFile,
  IconDocxFile,
} from '@coze-arch/bot-icons';

import { getFileExtension } from '../../utils/common';
import { type FileType } from './types';

export const PreviewFile: FC<RenderFileItemProps> = props => {
  const type = (getFileExtension(props.name) || 'unknown') as FileType;

  const components: Record<FileType, React.FC> = {
    unknown: IconUnknownFile,
    pdf: IconPDFFile,
    text: IconTextFile,
    docx: IconDocxFile,
  };

  const ComponentToRender = components[type] || IconUnknownFile;

  return <ComponentToRender />;
};
