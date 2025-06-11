import classNames from 'classnames';
import { Space } from '@coze/coze-design';

import { getBarBgColor, getBarHeights } from './utils';
import { type AudioWaveProps } from './type';

import styles from './index.module.less';

const waveBarNumberMap = {
  large: 41,
  medium: 29,
  small: 4,
};
export const AudioWave = ({
  size = 'medium',
  volumeNumber = 0,
  type = 'default',
  wrapperClassName,
  waveClassName,
}: AudioWaveProps) => {
  const volumeRealNumber = Math.max(Math.min(volumeNumber, 100), 0);
  const waveBarNumber = waveBarNumberMap[size] || 29;
  const waveBarHeights = getBarHeights(waveBarNumber, volumeRealNumber);

  return (
    <Space
      spacing={3}
      align="center"
      className={classNames(styles.container, wrapperClassName)}
    >
      {waveBarHeights.map((height, index) => (
        <div
          className={classNames(
            styles[`audio-wave-${index}`],
            styles[type],
            styles.bar,
            styles[size],
            waveClassName,
          )}
          style={{
            backgroundColor: getBarBgColor(index, waveBarNumber, type),
            height,
          }}
          key={`${type}_${index}`}
        />
      ))}
    </Space>
  );
};
