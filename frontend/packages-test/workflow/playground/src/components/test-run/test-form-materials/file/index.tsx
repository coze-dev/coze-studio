import React from 'react';

import { VoiceAdapter } from './voice-adapter';
import { type BaseFileProps, type FileProps } from './types';
import { TypedFileInput } from './typed-file-input';
import { FileBaseAdapter } from './base-adapter';

/** 这个组件还在 setter 中用到，暂不删除，未来解除依赖之后删除 */
export const FileAdapter: React.FC<FileProps> = props => {
  if (props.fileType === 'voice') {
    return <VoiceAdapter {...props} />;
  }

  if (props?.enableInputURL) {
    return <TypedFileInput {...(props as BaseFileProps)} />;
  }

  return <FileBaseAdapter {...(props as BaseFileProps)} />;
};
