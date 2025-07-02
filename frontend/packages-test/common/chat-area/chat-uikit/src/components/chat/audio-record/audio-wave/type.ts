export interface AudioWaveProps {
  size: 'small' | 'medium' | 'large';
  type: 'default' | 'primary' | 'warning';
  /** 0 ~ 100 */
  volumeNumber: number;
  wrapperClassName?: string;
  waveClassName?: string;
}
