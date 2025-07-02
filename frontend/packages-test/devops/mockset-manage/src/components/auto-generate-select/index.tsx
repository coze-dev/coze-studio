import { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { PluginMockDataGenerateMode } from '@coze-arch/bot-tea';
import { RadioGroup, Radio, InputNumber } from '@coze-arch/bot-semi';
// eslint-disable-next-line no-restricted-imports
import { type RadioChangeEvent } from '@douyinfe/semi-ui/lib/es/radio';

import {
  getLatestAutoGenerationChoice,
  setLatestAutoGenerationChoice,
} from '../../utils/auto-generate-storage';

import style from './index.module.less';

interface AutoGenerateSelectProps {
  showLabel?: boolean;
  enableMulti?: boolean;
  defaultCount?: number;
  onChange?: (mode: AutoGenerateConfig) => void;
  onInit?: (mode: AutoGenerateConfig) => void;
}

export interface AutoGenerateConfig {
  generateMode: PluginMockDataGenerateMode;
  generateCount?: number;
}

export function AutoGenerateSelect({
  showLabel,
  enableMulti,
  defaultCount,
  onChange,
  onInit,
}: AutoGenerateSelectProps) {
  const [config, setConfig] = useState<AutoGenerateConfig>({
    generateMode: PluginMockDataGenerateMode.MANUAL,
    generateCount: defaultCount || 1,
  });

  const onSelectChange = (e: RadioChangeEvent) => {
    const updatedConfig = { ...config, generateMode: e.target.value };
    setLatestAutoGenerationChoice(e.target.value);
    setConfig(updatedConfig);
    onChange?.(updatedConfig);
  };

  const initMode = async () => {
    const m = await getLatestAutoGenerationChoice();
    const initConfig = { ...config, generateMode: m };
    setConfig(initConfig);
    onInit?.(initConfig);
  };

  useEffect(() => {
    initMode();
  }, []);

  return (
    <div className={style['auto-generate-select']}>
      {showLabel ? (
        <h4 className={style['auto-generate-label']}>
          {I18n.t('plugin_creation_method')}
        </h4>
      ) : null}

      <RadioGroup
        type="card"
        value={config.generateMode}
        onChange={onSelectChange}
      >
        <Radio
          className={style['auto-generate-radio']}
          value={PluginMockDataGenerateMode.RANDOM}
          extra={I18n.t('generate_randomly_based_on_data_type_name')}
        >
          {I18n.t('randomlymode')}
        </Radio>
        <Radio
          className={style['auto-generate-radio']}
          value={PluginMockDataGenerateMode.LLM}
          extra={I18n.t('intelligently_generated_by_large_language_model')}
        >
          {I18n.t('llm_mode')}
        </Radio>
      </RadioGroup>

      {enableMulti && showLabel ? (
        <h4 className={style['auto-generate-label']}>
          {I18n.t('mock_data_quantity')}
        </h4>
      ) : null}

      {enableMulti ? (
        <InputNumber
          value={config.generateCount}
          max={5}
          min={1}
          onChange={e => {
            if (!Number.isNaN(Number(e))) {
              const updatedConfig = { ...config, generateCount: Number(e) };
              setConfig(updatedConfig);
              onChange?.(updatedConfig);
            }
          }}
        />
      ) : null}
    </div>
  );
}
