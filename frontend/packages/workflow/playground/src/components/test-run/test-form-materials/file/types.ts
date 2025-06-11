import type { ComponentAdapterCommonProps } from '../../types';

export enum FileInputType {
  UPLOAD = 'upload',
  INPUT = 'input',
}

export type FileProps = ComponentAdapterCommonProps<string> & {
  accept: string;
  multiple: boolean;
  disabled?: boolean;
  fileType: 'object' | 'image' | 'voice';
  // 支持文件地址输入
  enableInputURL?: boolean;
  // 文件输入类型变更事件
  fileInputType?: string;
  // 文件输入类型变更事件
  onInputTypeChange?: (v: string) => void;
  // 文件类型选择类名
  inputTypeSelectClassName?: string;
  // url输入类名
  inputURLClassName?: string;
  containerClassName?: string;
};

export type BaseFileProps = Omit<FileProps, 'fileType'> & {
  fileType: 'object' | 'image';
  className?: string;
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
