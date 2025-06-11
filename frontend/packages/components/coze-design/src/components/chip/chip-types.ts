import { type HTMLAttributes } from 'react';

export type IChipStyle = 'readonly' | 'remove' | 'select';

export type IChipColor =
  | 'brand'
  | 'primary'
  | 'green'
  | 'yellow'
  | 'red'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta';

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'mini';

  disabled?: boolean;
  loading?: boolean;

  color?:
    | 'brand'
    | 'primary'
    | 'green'
    | 'yellow'
    | 'red'
    | 'cyan'
    | 'blue'
    | 'purple'
    | 'magenta';

  chipStyle?: IChipStyle;

  onClickRemove?: (e: React.MouseEvent<SVGElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
