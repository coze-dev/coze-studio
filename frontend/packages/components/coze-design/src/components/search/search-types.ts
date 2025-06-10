import { type InputProps as SemiInputProps } from '@douyinfe/semi-ui/lib/es/input';

export interface SearchInputProps extends SemiInputProps {
  onSearch?: (value?: string) => void;
  width?: number | string;
}

export interface SearchProps extends SearchInputProps {
  loading?: boolean;
  placeholder?: string;
  hideIcon?: boolean;
  onSearch?: (value?: string) => void;
}

export type InputRefType = HTMLInputElement | null;
