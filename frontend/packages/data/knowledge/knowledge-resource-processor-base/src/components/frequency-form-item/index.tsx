import { type FC } from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Select, Typography } from '@coze/coze-design';

import { getFrequencyMap } from '../../utils';
import { FrequencyDay } from '../../constants';

import styles from './index.module.less';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export const FrequencyFormItem: FC<Props> = ({ value, onChange }) => (
  <div
    className={styles['frequency-form-item']}
    data-testid={KnowledgeE2e.OnlineUploadModalFrequencySelect}
  >
    <Typography.Text className={styles.title}>
      {I18n.t('datasets_frequencyModal_frequency')}
    </Typography.Text>
    <div className={styles.content}>
      <Select
        placeholder={I18n.t('datasets_frequencyModal_frequency')}
        style={{ width: '100%' }}
        value={value}
        onChange={v => onChange(v as number)}
      >
        {[
          FrequencyDay.ZERO,
          FrequencyDay.ONE,
          FrequencyDay.THREE,
          FrequencyDay.SEVEN,
          FrequencyDay.THIRTY,
        ].map(frequency => (
          <Select.Option key={frequency} value={frequency}>
            {getFrequencyMap(frequency)}
          </Select.Option>
        ))}
      </Select>
    </div>
  </div>
);
